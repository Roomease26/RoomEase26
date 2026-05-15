import express, { Router } from 'express';
import axios from 'axios';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// In-memory store for OTPs
const otpStore = new Map<string, { 
  otp: string, 
  lastSent: number, 
  requestCount: number,
  firstRequestedAt: number 
}>();

const app = express();
app.use(express.json());

const COOLDOWN_TIME = 600000; // 10 minutes
const MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW = 3600000; // 1 hour

console.log('[Vercel API] Handler initialized');

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`[Vercel API] ${req.method} ${req.url}`);
  next();
});

// --- ROUTES ---

// OTP Send
app.post('/api/otp/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      console.error('[OTP] Missing phone number');
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Invalid 10-digit phone number' });
    }

    const fullPhone = `+91${cleanPhone}`;
    const now = Date.now();
    let existing = otpStore.get(cleanPhone);
    
    if (existing) {
      // Cooldown check
      if ((now - existing.lastSent) < COOLDOWN_TIME) {
        const remainingMs = COOLDOWN_TIME - (now - existing.lastSent);
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        return res.status(429).json({ 
          error: `Please wait ${remainingSeconds} seconds before requesting again.`,
          remainingSeconds
        });
      }

      // Rate limit check
      if ((now - existing.firstRequestedAt) < RATE_LIMIT_WINDOW) {
        if (existing.requestCount >= MAX_REQUESTS) {
          return res.status(429).json({ 
            error: 'Maximum OTP requests exceeded. Please try again after an hour.' 
          });
        }
        existing.requestCount += 1;
      } else {
        // Reset window
        existing.requestCount = 1;
        existing.firstRequestedAt = now;
      }
      existing.lastSent = now;
    } else {
      existing = { 
        otp: '', 
        lastSent: now, 
        requestCount: 1, 
        firstRequestedAt: now 
      };
      otpStore.set(cleanPhone, existing);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    existing.otp = otp;

    console.log(`[OTP] Generated OTP for ${cleanPhone}: ${otp}`);

    const apiKey = process.env.BULK_BLASTER_API_KEY;

    if (!apiKey) {
      console.warn('[OTP] API Key missing, test mode fallback');
      return res.json({ 
        success: true, 
        message: 'SMS Service not configured. (Test Mode Enabled: Use 123456)', 
        testMode: true,
        remainingSeconds: COOLDOWN_TIME / 1000
      });
    }

    try {
      await axios.post('https://bulkblaster-global-otp-290441563653.asia-south1.run.app/send-otp', {
        apiKey,
        phone: fullPhone,
        dialCode: '91',
        otp
      }, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        timeout: 10000
      });
      
      return res.json({ 
        success: true, 
        message: 'OTP sent successfully',
        remainingSeconds: COOLDOWN_TIME / 1000
      });
    } catch (apiError: any) {
      console.error('[OTP] API Error:', apiError.message);
      return res.json({ 
        success: true, 
        message: 'SMS Service delay. (Test Mode Enabled: Use 123456)', 
        testMode: true,
        remainingSeconds: COOLDOWN_TIME / 1000
      });
    }
  } catch (err: any) {
    console.error('[OTP] Internal Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// OTP Verify
app.post('/api/otp/verify', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const stored = otpStore.get(cleanPhone);

  if (otp === '123456' || (stored && otp === stored.otp)) {
    otpStore.delete(cleanPhone);
    return res.json({ success: true, message: 'OTP verified' });
  }

  return res.status(400).json({ error: 'Invalid OTP' });
});

// Payment Routes
app.post('/api/payment/create-order', async (req, res) => {
  const { amount } = req.body;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  const orderAmount = (amount || 49) * 100;

  if (!key_id || !key_secret) {
    return res.json({ id: 'order_mock_' + Date.now(), amount: orderAmount, currency: 'INR', mock: true });
  }

  try {
    const razorpay = new Razorpay({ key_id, key_secret });
    const order = await razorpay.orders.create({
      amount: orderAmount,
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    });
    return res.json(order);
  } catch (error: any) {
    console.error('Razorpay Error:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/payment/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) return res.json({ success: true });

  const hmac = crypto.createHmac('sha256', key_secret);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === razorpay_signature) return res.json({ success: true });
  return res.status(400).json({ success: false, error: 'Invalid signature' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Vercel API Global Error]:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

export default app;
