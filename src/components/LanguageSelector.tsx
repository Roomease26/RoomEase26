import React from 'react';
import { motion } from 'motion/react';
import { Languages } from 'lucide-react';
import { Language } from '../types';

interface Props {
  onSelect: (lang: Language) => void;
}

export default function LanguageSelector({ onSelect }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#E5E9F0]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-[#F7F9FC] rounded-[40px] border-[8px] border-[#1A1F36] shadow-mobile overflow-hidden flex flex-col min-h-[640px]"
      >
        <div className="p-10 flex flex-col flex-1">
          <div className="text-3xl font-extrabold text-[#5469D4] mb-12 flex items-center justify-center gap-2">
            🏠 RoomEase
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-[#1A1F36] mb-2">Choose Language</h2>
            <p className="text-[13px] text-[#697386]">Select your preferred language to continue</p>
          </div>

          <div className="space-y-4">
            {(['en', 'hi', 'mr'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onSelect(lang)}
                className="w-full p-6 sleek-card flex items-center justify-between hover:border-[#5469D4] hover:bg-[#EBF1FF] transition-all group"
              >
                <div className="text-left">
                  <span className="block font-bold text-[#1A1F36] group-hover:text-[#5469D4]">
                    {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                  </span>
                  <span className="text-[10px] text-[#697386] uppercase tracking-wider">
                    {lang === 'en' ? 'Primary' : lang === 'hi' ? 'प्राथमिक' : 'प्राथमिक'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#F7F9FC] flex items-center justify-center font-bold text-xs text-[#5469D4]">
                  {lang.toUpperCase()}
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-auto pt-8 text-center">
            <p className="text-[11px] text-[#697386]">
              By continuing, you agree to our Terms <br />
              <span className="text-[#E1306C] font-semibold">@RoomEase</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
