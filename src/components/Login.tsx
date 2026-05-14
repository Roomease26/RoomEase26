import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Phone, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Language } from '../types';
import { translations } from '../translations';

interface Props {
  onLogin: (phone: string) => void;
  language: Language;
  forcedStep?: 'phone' | 'otp';
}

export default function Login({ onLogin, language, forcedStep }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>(forcedStep || 'phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isTestMode, setIsTestMode] = useState(false);

  const t = translations[language];

  useEffect(() => {
    console.log(`[Login] Component mounted. Step: ${step}, Phone: ${phone}`);
  }, []);

  useEffect(() => {
    if (forcedStep) {
      console.log(`[Login] Forced step change: ${forcedStep}`);
      setStep(forcedStep);
    }
  }, [forcedStep]);

  useEffect(() => {
    if (step === 'otp' && !phone) {
      console.warn('[Login] Missing phone number in OTP step, redirecting to phone input');
      navigate('/login');
    }
  }, [step, phone, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setError(language === 'en' ? 'Please enter a valid 10-digit phone number' : language === 'hi' ? 'कृपया एक वैध 10-अंकीय फोन नंबर दर्ज करें' : 'कृपया वैध १०-अंकी फोन नंबर प्रविष्ट करा');
      return;
    }
    setLoading(true);
    setError('');
    setIsTestMode(false);
    try {
      console.log(`[Login] Requesting OTP for ${phone}`);
      const res = await axios.post('/api/otp/send', { phone });
      setCooldown(60);
      if (res.data.testMode) {
        setIsTestMode(true);
      }
      console.log('[Login] OTP send success, navigating to verify');
      navigate(`/verify?phone=${phone}`);
    } catch (err: any) {
      console.error('[Login] Send OTP Error:', err);
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError(language === 'en' ? 'Please enter at least a 4-digit OTP' : language === 'hi' ? 'कृपया कम से कम 4-अंकीय OTP दर्ज करें' : 'कृपया किमान ४-अंकी OTP प्रविष्ट करा');
      return;
    }
    setLoading(true);
    setError('');
    try {
      console.log(`[Login] Verifying OTP for ${phone}`);
      await axios.post('/api/otp/verify', { phone, otp });
      console.log('[Login] OTP verified successfully');
      onLogin(phone);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[Login] Verify OTP Error:', err);
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#E5E9F0]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={step} // Force re-render on step change to avoid blank screen issues
        className="w-full max-w-[400px] bg-[#F7F9FC] rounded-[40px] border-[8px] border-[#1A1F36] shadow-mobile overflow-hidden flex flex-col min-h-[500px]"
      >
        <div className="p-8 flex flex-col flex-1">
          <div className="text-2xl font-extrabold text-[#5469D4] mb-8 flex items-center gap-2">
            🏠 RoomEase
          </div>

          <h2 className="text-xl font-bold text-[#1A1F36] mb-2">
            {step === 'phone' ? t.login_phone : t.verify_otp}
          </h2>
          <p className="text-[13px] text-[#697386] mb-8">
            {step === 'phone' 
              ? (language === 'en' ? 'We will send you a one-time password' : language === 'hi' ? 'हम आपको एक वन-टाइम पासवर्ड भेजेंगे' : 'आम्ही तुम्हाला वन-टाइम पासवर्ड पाठवू')
              : (language === 'en' ? `Enter the code sent to ${phone}` : language === 'hi' ? `${phone} पर भेजा गया कोड दर्ज करें` : `${phone} वर पाठवलेला कोड प्रविष्ट करा`)}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100">
              {error}
            </div>
          )}

          {isTestMode && step === 'otp' && (
            <div className="mb-6 p-3 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium border border-blue-100">
              {language === 'en' ? 'Use 123456 as OTP if not received' : 'यदि OTP प्राप्त नहीं हुआ है तो 123456 का उपयोग करें'}
            </div>
          )}

          <div className="space-y-4">
            {step === 'phone' ? (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#1A1F36]">{t.phone_placeholder}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#697386] font-medium text-sm">+91</span>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full sleek-input pl-12"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading || cooldown > 0}
                  className="w-full sleek-btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.sending}...
                    </>
                  ) : cooldown > 0 ? (
                    `${t.resend} in ${cooldown}s`
                  ) : (
                    t.send_otp
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-semibold text-[#1A1F36]">{t.otp_placeholder}</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder={t.otp_placeholder}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full sleek-input text-center tracking-[0.5em]"
                  />
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full sleek-btn-dark disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.verifying}...
                    </>
                  ) : (
                    t.verify_otp
                  )}
                </button>
                <div className="flex flex-col gap-4 mt-4">
                  <button
                    onClick={handleSendOtp}
                    disabled={loading || cooldown > 0}
                    className="text-[#5469D4] font-bold text-xs disabled:opacity-50"
                  >
                    {cooldown > 0 ? `${t.resend} OTP in ${cooldown}s` : `${t.resend} OTP`}
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-[#697386] font-medium text-xs"
                  >
                    {t.change_phone}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-auto pt-6 text-center">
            <p className="text-[11px] text-[#697386]">
              {t.follow_us} <br />
              <span className="text-[#E1306C] font-semibold">@RoomEase</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
