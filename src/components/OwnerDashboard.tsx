import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Plus, Clock, MapPin, Check, X, ArrowLeft } from 'lucide-react';
import { City, CITIES, Language } from '../types';
import { translations } from '../translations';

interface Props {
  areas: Record<City, string[]>;
  language: Language;
  onAddListing: (listing: any) => void;
}

export default function OwnerDashboard({ areas, language, onAddListing }: Props) {
  const [city, setCity] = useState<City>(CITIES[0]);
  const [area, setArea] = useState(areas[CITIES[0]][0]);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [days, setDays] = useState('Mon–Sat');
  const [slots, setSlots] = useState('10 AM – 1 PM, 5 PM – 8 PM');
  const [status, setStatus] = useState<'Available Now' | 'Not Available'>('Available Now');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [customArea, setCustomArea] = useState('');
  const [isCustomArea, setIsCustomArea] = useState(false);

  const t = translations[language];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remaining = 10 - photos.length;
      const filesToProcess = Array.from(files).slice(0, remaining);
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) {
      alert(language === 'en' ? 'Please upload at least 1 photo' : language === 'hi' ? 'कृपया कम से कम 1 फोटो अपलोड करें' : 'कृपया किमान १ फोटो अपलोड करा');
      return;
    }
    setLoading(true);
    onAddListing({
      city,
      area: isCustomArea ? customArea : area,
      address,
      landmark,
      availability: { days, slots, status },
      photos,
      createdAt: new Date().toISOString()
    });
    setIsSuccess(true);
    setLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-[#33CC66] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-[#1A1F36] mb-2">
          {t.listing_success}
        </h2>
        <p className="text-[#697386] mb-8">
          {t.live_msg}
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="sleek-btn-primary px-8"
        >
          {t.add_another}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-24">
      <div className="max-w-md mx-auto p-6">
        <header className="mb-8">
          <div className="sleek-tag mb-2 inline-block">{t.owner_panel}</div>
          <h1 className="text-2xl font-bold text-[#1A1F36]">
            {t.list_room}
          </h1>
          <p className="text-[13px] text-[#697386] mt-1">
            {t.form_desc}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-[12px] font-bold text-[#1A1F36] uppercase tracking-wider">
                {language === 'en' ? 'Photos' : language === 'hi' ? 'फोटो' : 'फोटो'} (1-10)
              </label>
              <span className="text-[10px] font-bold text-[#697386]">{photos.length}/10</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-200 relative group">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[8px] font-bold text-center py-1">
                      COVER
                    </div>
                  )}
                </div>
              ))}
              {photos.length < 10 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-[#E3E8EE] flex flex-col items-center justify-center cursor-pointer hover:border-[#5469D4] hover:bg-[#EBF1FF] transition-all">
                  <Camera className="w-6 h-6 text-[#697386] mb-1" />
                  <span className="text-[10px] font-bold text-[#697386] uppercase">{t.add}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="sleek-card p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#697386] uppercase">{t.select_city}</label>
              <select 
                value={city} 
                onChange={(e) => {
                  const newCity = e.target.value as City;
                  setCity(newCity);
                  setArea(areas[newCity][0]);
                  setIsCustomArea(false);
                }}
                className="w-full sleek-input"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#697386] uppercase">{t.select_area}</label>
              {isCustomArea ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'Enter area name...' : language === 'hi' ? 'क्षेत्र का नाम दर्ज करें...' : 'भागाचे नाव प्रविष्ट करा...'}
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    className="flex-1 sleek-input"
                  />
                  <button 
                    type="button"
                    onClick={() => setIsCustomArea(false)}
                    className="text-xs font-bold text-[#5469D4]"
                  >
                    {language === 'en' ? 'Cancel' : language === 'hi' ? 'रद्द करें' : 'रद्द करा'}
                  </button>
                </div>
              ) : (
                <select 
                  value={area} 
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomArea(true);
                    } else {
                      setArea(e.target.value);
                    }
                  }}
                  className="w-full sleek-input"
                >
                  {areas[city].map(a => <option key={a} value={a}>{a}</option>)}
                  <option value="custom">+ {language === 'en' ? 'Add New Area' : language === 'hi' ? 'नया क्षेत्र जोड़ें' : 'नवीन क्षेत्र जोडा'}</option>
                </select>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#697386] uppercase">{language === 'en' ? 'Address' : language === 'hi' ? 'पता' : 'पत्ता'}</label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={language === 'en' ? 'Full address of the room' : language === 'hi' ? 'कमरे का पूरा पता' : 'खोलीचा पूर्ण पत्ता'}
                className="w-full sleek-input min-h-[80px]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#697386] uppercase">{language === 'en' ? 'Landmark' : language === 'hi' ? 'लैंडमार्क' : 'लँडमार्क'}</label>
              <input 
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder={language === 'en' ? 'Near which famous place?' : language === 'hi' ? 'किस प्रसिद्ध स्थान के पास?' : 'कोणत्या प्रसिद्ध ठिकाणाजवळ?'}
                className="w-full sleek-input"
                required
              />
            </div>
          </div>

          {/* Availability */}
          <div className="sleek-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-[#5469D4]" />
              <h3 className="font-bold text-[#1A1F36]">{language === 'en' ? 'Availability' : language === 'hi' ? 'उपलब्धता' : 'उपलब्धता'}</h3>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#697386] uppercase">{language === 'en' ? 'Days' : language === 'hi' ? 'दिन' : 'दिवस'}</label>
              <input 
                type="text"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="e.g. Mon–Sat"
                className="w-full sleek-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#697386] uppercase">{language === 'en' ? 'Time Slots' : language === 'hi' ? 'समय स्लॉट' : 'वेळ स्लॉट'}</label>
              <input 
                type="text"
                value={slots}
                onChange={(e) => setSlots(e.target.value)}
                placeholder="e.g. 10 AM – 1 PM, 5 PM – 8 PM"
                className="w-full sleek-input"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus('Available Now')}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
                  status === 'Available Now' ? "bg-[#33CC66] text-white" : "bg-[#F7F9FC] text-[#697386]"
                }`}
              >
                {t.available}
              </button>
              <button
                type="button"
                onClick={() => setStatus('Not Available')}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${
                  status === 'Not Available' ? "bg-red-500 text-white" : "bg-[#F7F9FC] text-[#697386]"
                }`}
              >
                {t.not_available}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sleek-btn-primary py-5 text-lg shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (language === 'en' ? 'Adding Listing...' : language === 'hi' ? 'लिस्टिंग जोड़ी जा रही है...' : 'लिस्टिंग जोडली जात आहे...') : (language === 'en' ? 'List My Room' : language === 'hi' ? 'मेरा कमरा लिस्ट करें' : 'माझी खोली लिस्ट करा')}
            {!loading && <Plus className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
