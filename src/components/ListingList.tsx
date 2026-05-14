import React from 'react';
import { Listing, UserProfile, Language } from '../types';
import ListingCard from './ListingCard';
import { Search, ArrowLeft } from 'lucide-react';
import { translations } from '../translations';

interface Props {
  listings: Listing[];
  isPaid: boolean;
  user: UserProfile;
  city: string;
  area: string;
  language: Language;
  onUnlock: () => void;
  onChat: (listing: Listing) => void;
  onBack: () => void;
}

export default function ListingList({ listings, isPaid, user, city, area, language, onUnlock, onChat, onBack }: Props) {
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-24">
      <div className="max-w-md mx-auto">
        <header className="bg-white px-6 py-4 border-b border-[#E3E8EE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="w-8 h-8 bg-[#F7F9FC] rounded-full flex items-center justify-center text-[#5469D4]"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="sleek-tag">{t.select_city}</div>
              <h1 className="text-sm font-bold text-[#1A1F36]">{city} • {area}</h1>
            </div>
          </div>
          <button onClick={onBack} className="text-[18px]">📍</button>
        </header>

        <div className="bg-[#EBF1FF] px-6 py-2 text-center">
          <p className="text-[12px] font-bold text-[#5469D4]">
            {listings.length} {t.rooms_available}
          </p>
        </div>

        <div className="p-4">
          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1F36]">{language === 'en' ? 'No rooms found' : language === 'hi' ? 'कोई कमरा नहीं मिला' : 'खोल्या सापडल्या नाहीत'}</h3>
              <p className="text-[13px] text-[#697386] max-w-[200px]">{t.no_results}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isPaid={isPaid}
                  user={user}
                  language={language}
                  onUnlock={onUnlock}
                  onChat={() => onChat(listing)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 p-6 text-center text-[11px] text-[#697386] border-t border-[#E3E8EE] bg-white">
          {language === 'en' ? `Unlock 5 days of full access to all rooms in ${city} and chat with owners directly.` : language === 'hi' ? `${city} में सभी कमरों के लिए 5 दिनों का पूर्ण एक्सेस अनलॉक करें और मालिकों से सीधे चैट करें।` : `${city} मधील सर्व खोल्यांसाठी ५ दिवसांचा पूर्ण ॲक्सेस अनलॉक करा आणि मालकांशी थेट चॅट करा.`}
        </div>
      </div>
    </div>
  );
}
