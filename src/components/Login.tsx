import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Phone, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Language } from '../types';
import { translations } from '../translations';

interface Props {
  onLogin: (phone: string) => void;
  language: Language;
}

export default function Login({ onLogin, language }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Determine step from URL
  const isVerifyPage = location.pathname === '/verify';
  
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isTestMode, setIsTestMode] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const urlPhone = searchParams.get('phone');
    if (urlPhone) setPhone(urlPhone);
  }, [searchParams]);

  useEffect(() => {
    if (isVerifyPage && !phone && !searchParams.get('phone')) {
      navigate('/login');
    }
  }, [isVerifyPage, phone, navigate, searchParams]);

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
      setError(language === 'en' ? 'Please enter a valid 10-digit phone number' : 'कृपया एक वैध 10-अंकीय फोन नंबर दर्ज करें');
      return;
    }
    setLoading(true);
    setError('');
    setIsTestMode(false);
    try {
      console.log(`[Login] Requesting OTP for ${phone}`);
      const res = await axios.post('/api/otp/send', { phone });
      
      console.log('[Login] API Success Response:', res.data);
      
      setCooldown(30); 
      
      if (res.data.testMode) {
        setIsTestMode(true);
      }
      
      if (res.data.message && res.data.testMode) {
        setError(String(res.data.message)); 
      }

      console.log('[Login] OTP send success, navigating to verify');
      navigate(`/verify?phone=${phone}`);
    } catch (err: any) {
      console.error('[Login] Send OTP Error:', err);
      const errorData = err.response?.data;
      let displayMsg = 'Failed to send OTP. Please check your connection.';
      
      if (errorData) {
        if (typeof errorData === 'string') displayMsg = errorData;
        else if (errorData.message && typeof errorData.message === 'string') displayMsg = errorData.message;
        else if (errorData.error && typeof errorData.error === 'string') displayMsg = errorData.error;
      } else if (err.message) {
        displayMsg = err.message;
      }
      
      setError(String(displayMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError(language === 'en' ? 'Enter valid OTP' : 'सही OTP दर्ज करें');
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
      const errorData = err.response?.data;
      let displayMsg = 'Invalid OTP. Please try again.';
      
      if (errorData) {
        if (typeof errorData === 'string') displayMsg = errorData;
        else if (errorData.message && typeof errorData.message === 'string') displayMsg = errorData.message;
        else if (errorData.error && typeof errorData.error === 'string') displayMsg = errorData.error;
      } else if (err.message) {
        displayMsg = err.message;
      }
      
      setError(String(displayMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#E5E9F0] min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={isVerifyPage ? 'verify' : 'login'}
        className="w-full max-w-[400px] bg-[#F7F9FC] rounded-[40px] border-[8px] border-[#1A1F36] shadow-mobile overflow-hidden flex flex-col min-h-[550px]"
      >
        <div className="p-8 flex flex-col flex-1">
          <div className="text-2xl font-extrabold text-[#5469D4] mb-8 flex items-center gap-2">
            🏠 RoomEase
          </div>

          <h2 className="text-xl font-bold text-[#1A1F36] mb-2 uppercase tracking-tight">
            {!isVerifyPage ? t.login_phone : t.verify_otp}
          </h2>
          <p className="text-[13px] text-[#697386] mb-8 leading-relaxed">
            {!isVerifyPage 
              ? (language === 'en' ? 'We will send you a 6-digit one-time password' : 'हम आपको 6-अंकीय वन-टाइम पासवर्ड भेजेंगे')
              : (language === 'en' ? `Enter the code sent to ${phone}` : `${phone} पर भेजा गया कोड दर्ज करें`)}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[13px] font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
              {String(error)}
            </div>
          )}

          {isTestMode && isVerifyPage && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-600 rounded-2xl text-[13px] font-medium border border-blue-100">
              {language === 'en' ? 'Use 123456 as OTP if not received' : 'यदि OTP प्राप्त नहीं हुआ है तो 123456 का उपयोग करें'}
            </div>
          )}

          <div className="space-y-6">
            {!isVerifyPage ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-[#1A1F36] uppercase tracking-wider">{t.phone_placeholder}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1F36] font-bold text-sm">+91</span>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full h-[52px] bg-white rounded-2xl border-2 border-[#E6E9F2] px-14 focus:border-[#5469D4] focus:outline-none transition-all font-bold text-[#1A1F36]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading || cooldown > 0}
                  className="w-full h-[52px] bg-[#5469D4] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    <>
                      {t.send_otp}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-[#1A1F36] uppercase tracking-wider">ENTER OTP</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="______"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full h-[60px] bg-white rounded-2xl border-2 border-[#E6E9F2] text-center tracking-[0.5em] font-extrabold text-[#1A1F36] text-xl focus:border-[#5469D4] focus:outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full h-[52px] bg-[#1A1F36] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {t.verify_otp}
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
                <div className="flex flex-col gap-4 mt-2">
                  <button
                    onClick={handleSendOtp}
                    disabled={loading || cooldown > 0}
                    className="text-[#5469D4] font-bold text-xs disabled:opacity-50 hover:underline"
                  >
                    {cooldown > 0 ? `${t.resend} OTP in ${cooldown}s` : `Didn't receive OTP? ${t.resend}`}
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-[#697386] font-bold text-xs hover:text-[#1A1F36]"
                  >
                    {t.change_phone}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-auto pt-8 text-center border-t border-[#E6E9F2]">
            <p className="text-[11px] text-[#697386] font-medium">
              Made with ❤️ for tenants <br />
              <span className="text-[#1A1F36] font-bold">@RoomEase</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
