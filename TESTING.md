# Testing RoomEase

## Login
- **Admin Phone:** `9999999999`
- **User Phone:** Any 10-digit number
- **Real OTP:** Sent via Bulk Blaster API (4 digits)
- **Test OTP:** `123456` (Fallback enabled for convenience)

## Payment
- **Amount:** ₹50
- **Mode:** Test Mode (Razorpay)
- **Mock Success:** If Razorpay keys are not provided in `.env`, the app will simulate a successful payment after 1 second.

## Features
1. **Language Selection:** Choose between English, Hindi, and Marathi.
2. **City/Area:** Select from 5 cities and their respective areas.
3. **Owner Dashboard:** Add listings with photos (camera supported).
4. **Premium Unlock:** Pay ₹50 to see full details and chat.
5. **AI Room Visualizer:** Generate dream room images using Gemini AI (located in Profile tab).
6. **Admin Panel:** Accessible only via the admin phone number.
