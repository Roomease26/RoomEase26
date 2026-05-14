import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, ChevronRight, Search, Plus } from 'lucide-react';
import { CITIES, City, Language } from '../types';
import { translations } from '../translations';

interface Props {
  areas: Record<City, string[]>;
  language: Language;
  onSelect: (city: City, area: string) => void;
}

export default function CitySelector({ areas, language, onSelect }: Props) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [customArea, setCustomArea] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 pb-24">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <div className="sleek-tag mb-2 inline-block">Location</div>
          <h1 className="text-2xl font-bold text-[#1A1F36] mb-1">
            {language === 'en' ? 'Where are you looking?' : language === 'hi' ? 'आप कहां ढूंढ रहे हैं?' : 'तुम्ही कोठे शोधत आहात?'}
          </h1>
          <p className="text-[13px] text-[#697386]">
            {language === 'en' ? 'Select a city to find available rooms' : language === 'hi' ? 'उपलब्ध कमरे खोजने के लिए एक शहर चुनें' : 'उपलब्ध खोल्या शोधण्यासाठी शहर निवडा'}
          </p>
        </header>

        {!selectedCity ? (
          <div className="space-y-3">
            {CITIES.map((city) => (
              <motion.button
                key={city}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCity(city)}
                className="w-full sleek-card p-4 flex items-center justify-between group hover:border-[#5469D4] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#EBF1FF] rounded-lg flex items-center justify-center group-hover:bg-[#5469D4] transition-colors">
                    <MapPin className="w-5 h-5 text-[#5469D4] group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <span className="block text-lg font-semibold text-[#1A1F36]">{city}</span>
                    <span className="text-[11px] text-[#697386] font-medium">
                      {areas[city].length} {t.rooms_available}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#E3E8EE]" />
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <button
              onClick={() => {
                setSelectedCity(null);
                setShowCustomInput(false);
              }}
              className="text-[#5469D4] font-medium mb-4 flex items-center gap-1 text-sm"
            >
              ← {t.back}
            </button>
            <h2 className="text-lg font-bold text-[#1A1F36] mb-4">
               {t.select_area} in {selectedCity}
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {areas[selectedCity].map((area) => (
                <button
                  key={area}
                  onClick={() => onSelect(selectedCity, area)}
                  className="w-full sleek-card p-4 text-left hover:bg-[#EBF1FF] hover:border-[#5469D4] transition-all font-medium text-[#1A1F36] text-sm"
                >
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
        )}
      </div>
    </div>
  );
}
