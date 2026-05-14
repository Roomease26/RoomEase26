import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, CheckCircle2, Lock, MessageSquare } from 'lucide-react';
import { Listing, UserProfile, PRICING, Language } from '../types';
import { cn } from '../lib/utils';
import ImageCarousel from './ImageCarousel';
import { translations } from '../translations';

interface Props {
  listing: Listing;
  isPaid: boolean;
  language: Language;
  user?: UserProfile;
  onUnlock: () => void;
  onChat: () => void;
}

export default function ListingCard({ listing, isPaid, language, user, onUnlock, onChat }: Props) {
  const t = translations[language];

  const getExpiryInfo = () => {
    if (user?.role === 'admin') return null;
    if (!user?.unlockedCities) return null;
    const expiryStr = user.unlockedCities[listing.city];
    if (!expiryStr) return null;

    const expiry = new Date(expiryStr);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        text: language === 'en' ? 'Your access has expired. Unlock again.' : language === 'hi' ? 'आपकी एक्सेस समाप्त हो गई है। फिर से अनलॉक करें।' : 'तुमचा ॲक्सेस संपला आहे. पुन्हा अनलॉक करा.', 
        color: 'text-red-600 bg-red-50' 
      };
    }
    if (diffDays === 0) {
      return { 
        text: language === 'en' ? 'Your access will expire today at 11:59 PM' : language === 'hi' ? 'आपकी एक्सेस आज रात 11:59 बजे समाप्त हो जाएगी' : 'तुमचा ॲक्सेस आज रात्री ११:५९ वाजता संपेल', 
        color: 'text-orange-600 bg-orange-50' 
      };
    }
    return { 
      text: language === 'en' ? `${diffDays} days left in your access for ${listing.city}` : language === 'hi' ? `${listing.city} के लिए आपकी एक्सेस में ${diffDays} दिन बचे हैं` : `${listing.city} साठी तुमच्या ॲक्सेसमध्ये ${diffDays} दिवस उरले आहेत`, 
      color: 'text-[#5469D4] bg-[#EBF1FF]' 
    };
  };

  const expiryInfo = getExpiryInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sleek-card overflow-hidden relative"
    >
      {/* Image Section */}
      <ImageCarousel images={listing.photos} showWatermark={true} />

      {/* Content Section */}
      <div className="p-4">
        {!isPaid ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="h-2 w-24 bg-slate-100 rounded-full" />
              <div className="h-2 w-16 bg-slate-100 rounded-full" />
            </div>
            <button
              onClick={onUnlock}
              className="w-full sleek-btn-accent"
            >
              {t.unlock}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#1A1F36]">
                {language === 'en' ? 'Room in' : language === 'hi' ? 'कमरा' : 'खोली'} {listing.area}
              </h3>
              <p className="text-xs text-[#697386]">{listing.city}</p>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-[#E3E8EE]">
              <div className="flex items-start gap-2 text-[#697386]">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="text-[13px]"><strong>{language === 'en' ? 'Address' : language === 'hi' ? 'पता' : 'पत्ता'}:</strong> {listing.address}</span>
              </div>
              <div className="flex items-start gap-2 text-[#697386]">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="text-[13px]"><strong>{language === 'en' ? 'Landmark' : language === 'hi' ? 'लैंडमार्क' : 'लँडमार्क'}:</strong> {listing.landmark}</span>
              </div>
              <div className="flex items-start gap-2 text-[#697386]">
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div className="text-[13px]">
                  <p className="font-bold">{language === 'en' ? 'Availability' : language === 'hi' ? 'उपलब्धता' : 'उपलब्धता'}:</p>
                  <p>{listing.availability.days} • {listing.availability.slots}</p>
                </div>
              </div>
            </div>

            <button
              onClick={onChat}
              className="w-full sleek-btn-dark flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {language === 'en' ? 'Chat with Owner' : language === 'hi' ? 'मालिक से चैट करें' : 'मालकाशी चॅट करा'}
            </button>

            {expiryInfo && (
              <div className={cn(
                "p-3 rounded-xl text-[11px] font-bold text-center",
                expiryInfo.color
              )}>
                {expiryInfo.text}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
