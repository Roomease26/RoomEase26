import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Zap, Clock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { Language, PRICING } from '../types';
import { translations } from '../translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userPhone: string;
  language: Language;
  city: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentModal({ isOpen, onClose, onSuccess, userPhone, language, city }: Props) {
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data: order } = await axios.post('/api/payment/create-order', { amount: PRICING.UNLOCK_FEE });

      const options = {
        key: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'RoomEase',
        description: `Unlock Full access for ${city} (valid for 5 days)`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await axios.post('/api/payment/verify', response);
            onSuccess();
          } catch (err) {
            alert(language === 'en' ? 'Payment verification failed' : language === 'hi' ? 'भुगतान सत्यापन विफल रहा' : 'पेमेंट व्हेरिफिकेशन अयशस्वी झाले');
          }
        },
        prefill: {
          contact: userPhone,
        },
        theme: {
          color: '#5469D4',
        },
      };

      if (order.mock) {
        // Mock success for testing
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      alert(language === 'en' ? 'Failed to initiate payment' : language === 'hi' ? 'भुगतान शुरू करने में विफल' : 'पेमेंट सुरू करण्यात अयशस्वी');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="relative w-full max-w-md bg-[#F7F9FC] rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-mobile"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="w-10 h-10 bg-[#EBF1FF] rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#5469D4]" />
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-[#697386]" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-[#1A1F36] mb-1 text-center">
                {language === 'en' ? `Unlock ${city}` : language === 'hi' ? `${city} अनलॉक करें` : `${city} अनलॉक करा`}
              </h2>
              <p className="text-[13px] text-[#697386] text-center mb-1">
                {language === 'en' ? 'Unlock full city access for ₹49 (valid for 5 days)' : language === 'hi' ? '₹49 में पूरे शहर का उपयोग अनलॉक करें (5 दिनों के लिए वैध)' : '₹49 मध्ये पूर्ण शहराचा वापर अनलॉक करा (5 दिवसांसाठी वैध)'}
              </p>
              
              <div className="flex justify-center mt-3 mb-8">
                <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'en' ? 'All areas included' : language === 'hi' ? 'सभी क्षेत्र शामिल' : 'सर्व क्षेत्र समाविष्ट आहेत'}
                </span>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-4 p-4 sleek-card">
                  <div className="w-10 h-10 bg-[#EBF1FF] rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#5469D4]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1F36] text-sm">
                      {PRICING.VALIDITY_DAYS} {language === 'en' ? 'Days Access' : language === 'hi' ? 'दिनों की एक्सेस' : 'दिवसांचा ॲक्सेस'}
                    </p>
                    <p className="text-[11px] text-[#697386]">Full unlock for all listings</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 sleek-card">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[#33CC66]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1F36] text-sm">{language === 'en' ? 'Direct Chat' : language === 'hi' ? 'सीधी चैट' : 'थेट चॅट'}</p>
                    <p className="text-[11px] text-[#697386]">Connect with owners instantly</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 sleek-card">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1F36] text-sm">Verified Listings</p>
                    <p className="text-[11px] text-[#697386]">Safe and secure room discovery</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full sleek-btn-accent py-4 text-lg"
              >
                {loading ? (language === 'en' ? 'Processing...' : language === 'hi' ? 'प्रक्रिया हो रही है...' : 'प्रक्रिया सुरू आहे...') : `${t.unlock}`}
              </button>
              
              <p className="mt-6 text-center text-[10px] text-[#697386] uppercase tracking-widest font-bold">
                Secure Payment via Razorpay
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
