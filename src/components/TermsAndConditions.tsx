import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ScrollText, Check } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface Props {
  onAccept: () => void;
  language: Language;
}

export default function TermsAndConditions({ onAccept, language }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setHasScrolledToBottom(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white rounded-[40px] border-[8px] border-[#1A1F36] shadow-mobile overflow-hidden flex flex-col h-[640px]"
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-[#EBF1FF] rounded-xl flex items-center justify-center">
              <ScrollText className="w-5 h-5 text-[#5469D4]" />
            </div>
            <h1 className="text-xl font-bold text-[#1A1F36]">{t.terms_title}</h1>
          </div>

          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto pr-2 mb-6 space-y-4 text-[13px] text-[#697386] scrollbar-thin scrollbar-thumb-slate-200"
          >
            <section>
              <h3 className="font-bold text-[#1A1F36] mb-1">1. Usage</h3>
              <p>RoomEase is a platform for room rental discovery. Users must provide accurate information.</p>
            </section>
            <section>
              <h3 className="font-bold text-[#1A1F36] mb-1">2. Payments</h3>
              <p>Unlock premium access for ₹49. This access is valid for 5 days. All payments are non-refundable.</p>
            </section>
            <section>
              <h3 className="font-bold text-[#1A1F36] mb-1">3. User Responsibility</h3>
              <p>Users are responsible for verifying room details and owner credentials before making any commitments.</p>
            </section>
            <section>
              <h3 className="font-bold text-[#1A1F36] mb-1">4. Owner Responsibility</h3>
              <p>Owners must list verified and accurate room details. Misleading listings will be removed.</p>
            </section>
            <section>
              <h3 className="font-bold text-[#1A1F36] mb-1">5. Privacy</h3>
              <p>We value your privacy. Your data is stored securely and used only for service improvement.</p>
            </section>
            <section>
              <h3 className="font-bold text-[#1A1F36] mb-1">6. Restrictions</h3>
              <p>Spamming, harassment, or any illegal activity on the platform is strictly prohibited.</p>
            </section>
            <section>
              <h3 className="font-bold text-[#1A1F36] mb-1">7. Updates</h3>
              <p>Terms may be updated periodically. Continued use implies acceptance of revised terms.</p>
            </section>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-0.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#E3E8EE] bg-white checked:bg-[#5469D4] checked:border-[#5469D4] transition-all"
                />
                <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none" />
              </div>
              <span className="text-[12px] text-[#697386] leading-tight">
                {t.terms}
              </span>
            </label>

            <button
              onClick={onAccept}
              disabled={!agreed}
              className="w-full sleek-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.continue}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
