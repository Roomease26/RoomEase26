import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Search, Plus } from 'lucide-react';
import { City, Language } from '../types';
import { translations } from '../translations';

interface Props {
  areas: Record<City, string[]>;
  language: Language;
  onSelect: (city: City, area: string) => void;
}

export default function CitySelector({ areas, language, onSelect }: Props) {
  const [customArea, setCustomArea] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const t = translations[language];
  const selectedCity = "Bramhapuri";

  // Filter and display only Bramhapuri areas
  const bramhapuriAreas = areas[selectedCity] || [];

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 pb-24">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <div className="sleek-tag mb-2 inline-block">Location</div>
          <h1 className="text-2xl font-bold text-[#1A1F36] mb-1">
            {language === 'en' ? 'Select an Area' : language === 'hi' ? 'क्षेत्र चुनें' : 'भाग निवडा'}
          </h1>
          <p className="text-[13px] text-[#697386]">
            {language === 'en' ? 'Select an area in Bramhapuri to find available rooms' : language === 'hi' ? 'उपलब्ध कमरे खोजने के लिए ब्रह्मपुरी में एक क्षेत्र चुनें' : 'उपलब्ध खोल्या शोधण्यासाठी ब्रह्मपुरी मधील भाग निवडा'}
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-[#1A1F36] mb-4 uppercase tracking-wide text-xs text-[#5469D4]">
             Bramhapuri Areas ({bramhapuriAreas.length})
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {bramhapuriAreas.map((area) => (
              <button
                key={area}
                onClick={() => onSelect(selectedCity, area)}
                className="w-full sleek-card p-4 text-left hover:bg-[#EBF1FF] hover:border-[#5469D4] transition-all font-medium text-[#1A1F36] text-sm flex items-center gap-3"
              >
                <MapPin className="w-4 h-4 text-[#5469D4]" />
                {area}
              </button>
            ))}

            {showCustomInput ? (
              <div className="sleek-card p-4 space-y-3">
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Enter area name...' : language === 'hi' ? 'क्षेत्र का नाम दर्ज करें...' : 'भागाचे नाव प्रविष्ट करा...'}
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  className="w-full sleek-input"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowCustomInput(false)}
                    className="flex-1 py-2 text-xs font-bold text-[#697386]"
                  >
                    {language === 'en' ? 'Cancel' : language === 'hi' ? 'रद्द करें' : 'रद्द करा'}
                  </button>
                  <button 
                    onClick={() => customArea && onSelect(selectedCity, customArea)}
                    disabled={!customArea}
                    className="flex-1 py-2 text-xs font-bold text-white bg-[#5469D4] rounded-xl disabled:opacity-50"
                  >
                    {t.add} & {language === 'en' ? 'Select' : language === 'hi' ? 'चुनें' : 'निवडा'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomInput(true)}
                className="p-4 border-2 border-dashed border-[#E3E8EE] rounded-3xl flex items-center justify-center gap-2 text-[#697386] hover:border-[#5469D4] hover:text-[#5469D4] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-bold">
                  {language === 'en' ? 'Area not listed? Add manually' : language === 'hi' ? 'क्षेत्र सूचीबद्ध नहीं है? मैन्युअल रूप से जोड़ें' : 'क्षेत्र सूचीबद्ध नाही? मॅन्युअली जोडा'}
                </span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
