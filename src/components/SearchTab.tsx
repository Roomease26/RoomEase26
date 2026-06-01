import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, X, Home } from 'lucide-react';
import { Listing, Language, UserProfile } from '../types';
import ListingCard from './ListingCard';
import { translations } from '../translations';

interface Props {
  listings: Listing[];
  user: UserProfile;
  areas: Record<string, string[]>;
  isCityPaid: (city: string) => boolean;
  language: Language;
  onUnlock: (city: string) => void;
  onChat: (listing: Listing) => void;
}

export default function SearchTab({ listings, user, areas, isCityPaid, language, onUnlock, onChat }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('Bramhapuri');
  const [selectedArea, setSelectedArea] = useState<string>('');

  const t = translations[language];

  const cities = Object.keys(areas).sort((a, b) => a.localeCompare(b));
  console.log("Available Cities:", cities);

  const filteredListings = listings.filter(listing => {
    const matchesQuery = listing.area.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        listing.landmark.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = listing.city === "Bramhapuri";
    const matchesArea = selectedArea ? listing.area === selectedArea : true;
    return matchesQuery && matchesCity && matchesArea;
  });

  console.log("AREAS ARRAY:", areas);
  console.log("AREAS LENGTH:", (areas as any)?.length);

  if ((areas as any)?.length > 0) {
    console.log("FIRST AREA:", (areas as any)[0]);
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 pb-24">
      <div>
        <h3>DEBUG AREAS</h3>
        <pre>{JSON.stringify(areas, null, 2)}</pre>
      </div>
      <div className="max-w-md mx-auto">
        <header className="mb-6">
          <div className="sleek-tag mb-2 inline-block">{t.search}</div>
          <h1 className="text-2xl font-bold text-[#1A1F36] mb-4">
            {language === 'en' ? 'Find your next room' : language === 'hi' ? 'अपना अगला कमरा ढूंढें' : 'तुमची पुढची खोली शोधा'}
          </h1>
          
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#697386]" />
              <input
                type="text"
                placeholder={t.search + "..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sleek-input pl-11"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full sleek-input py-2 text-xs"
              >
                <option value="">{t.select_area}</option>
                {areas["Bramhapuri"]?.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1A1F36]">
              {filteredListings.length} {t.rooms_available}
            </h2>
            {(searchQuery || selectedArea) && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedArea('');
                }}
                className="text-xs text-[#5469D4] font-bold"
              >
                {language === 'en' ? 'Clear All' : language === 'hi' ? 'सब साफ़ करें' : 'सर्व साफ करा'}
              </button>
            )}
          </div>

          {filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-[#E3E8EE]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Home className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1F36]">{language === 'en' ? 'No rooms found' : language === 'hi' ? 'कोई कमरा नहीं मिला' : 'खोल्या सापडल्या नाहीत'}</h3>
              <p className="text-[13px] text-[#697386] max-w-[200px] mx-auto">{t.no_results}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isPaid={isCityPaid(listing.city)}
                  user={user}
                  language={language}
                  onUnlock={() => onUnlock(listing.city)}
                  onChat={() => onChat(listing)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
