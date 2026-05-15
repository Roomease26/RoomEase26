import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Plus, Clock, MapPin, Check, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { City, CITIES, Language, Area, Listing } from '../types';
import { translations } from '../translations';
import { areaService } from '../services/dataService';
import { Trash2, ExternalLink } from 'lucide-react';

interface Props {
  areas: Record<City, string[]>;
  language: Language;
  onAddListing: (listing: any) => void;
  onDeleteListing: (id: string) => void;
  currentUserId: string;
  listings: Listing[];
}

export default function OwnerDashboard({ areas, language, onAddListing, onDeleteListing, currentUserId, listings }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'add' | 'manage'>('add');
  const [city, setCity] = useState<City>(CITIES[0]);
  const [area, setArea] = useState(areas[CITIES[0]]?.[0] || '');
  const [address, setAddress] = useState('');
  // ...
  const [landmark, setLandmark] = useState('');
  const [days, setDays] = useState('Mon–Sat');
  const [slots, setSlots] = useState('10 AM – 1 PM, 5 PM – 8 PM');
  const [status, setStatus] = useState<'Available Now' | 'Not Available'>('Available Now');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [customArea, setCustomArea] = useState('');
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [areaError, setAreaError] = useState('');

  const t = translations[language];

  const formatAreaName = (name: string) => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const validateAreaName = (name: string) => {
    if (name.length < 3) return t.area_name_hint;
    if (name.length > 40) return 'Max 40 characters';
    if (/[@!$#%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(name)) return t.invalid_area;
    return '';
  };

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

  const handleAddNewArea = async () => {
    setAreaError('');
    const formatted = formatAreaName(customArea.trim());
    const error = validateAreaName(formatted);
    if (error) {
      setAreaError(error);
      return;
    }

    try {
      setLoading(true);
      await areaService.addArea({
        city,
        areaName: formatted,
        createdBy: currentUserId,
        createdAt: new Date().toISOString()
      });
      setArea(formatted);
      setIsCustomArea(false);
      setCustomArea('');
      setLoading(false);
    } catch (err: any) {
      setAreaError(err.message === 'Area already exists in this city' ? t.duplicate_area : err.message);
      setLoading(false);
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
            {t.owner} Dashboard
          </h1>
          
          <div className="flex gap-2 mt-6 p-1 bg-[#E3E8EE] rounded-xl">
            <button
              onClick={() => setActiveSubTab('add')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'add' ? 'bg-white text-[#5469D4] shadow-sm' : 'text-[#697386]'
              }`}
            >
              {language === 'en' ? 'Add Listing' : language === 'hi' ? 'लिस्टिंग जोड़ें' : 'लिस्टिंग जोडा'}
            </button>
            <button
              onClick={() => setActiveSubTab('manage')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'manage' ? 'bg-white text-[#5469D4] shadow-sm' : 'text-[#697386]'
              }`}
            >
              {language === 'en' ? 'My Listings' : language === 'hi' ? 'मेरी लिस्टिंग' : 'माझ्या लिस्टिंग'} ({listings.length})
            </button>
          </div>
        </header>

        {activeSubTab === 'add' ? (
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
                    setArea(areas[newCity]?.[0] || '');
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
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t.area_name}
                        value={customArea}
                        onChange={(e) => {
                          setCustomArea(e.target.value);
                          setAreaError('');
                        }}
                        className={`flex-1 sleek-input ${areaError ? 'border-red-500' : ''}`}
                      />
                      <button 
                        type="button"
                        onClick={handleAddNewArea}
                        disabled={loading || !customArea.trim()}
                        className="bg-[#5469D4] text-white px-4 rounded-xl font-bold text-xs disabled:opacity-50"
                      >
                        {t.add}
                      </button>
                    </div>
                    {areaError && (
                      <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3" />
                        {areaError}
                      </div>
                    )}
                    <button 
                      type="button"
                      onClick={() => {
                        setIsCustomArea(false);
                        setAreaError('');
                      }}
                      className="text-[10px] font-bold text-[#697386] uppercase tracking-wider"
                    >
                      ← {translations[language].back}
                    </button>
                  </div>
                ) : (
                  <select 
                    value={area} 
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomArea(true);
                        setAreaError('');
                      } else {
                        setArea(e.target.value);
                      }
                    }}
                    className="w-full sleek-input"
                  >
                    {(areas[city] || []).map(a => <option key={a} value={a}>{a}</option>)}
                    <option value="custom">+ {t.add_area}</option>
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
        ) : (
          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-[#E3E8EE]">
                <Plus className="w-10 h-10 text-[#697386] mx-auto mb-3 opacity-20" />
                <p className="text-[#697386] text-sm">No listings yet</p>
              </div>
            ) : (
              listings.map((item) => (
                <div key={item.id} className="sleek-card overflow-hidden">
                  <div className="aspect-video relative">
                    <img src={item.photos[0]} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(language === 'en' ? 'Delete this listing?' : 'इस लिस्टिंग को हटा दें?')) {
                            onDeleteListing(item.id);
                          }
                        }}
                        className="bg-white/90 p-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      item.availability.status === 'Available Now' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {item.availability.status === 'Available Now' ? t.available : t.not_available}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#5469D4] uppercase tracking-wider mb-1">
                      <MapPin className="w-3 h-3" />
                      {item.city} • {item.area}
                    </div>
                    <h3 className="font-bold text-[#1A1F36] text-sm truncate">{item.address}</h3>
                    <div className="mt-3 pt-3 border-t border-[#E3E8EE] flex justify-between items-center">
                      <div className="flex items-center gap-2 text-[#697386]">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">{item.availability.days}</span>
                      </div>
                      <button className="text-[10px] font-bold text-[#5469D4] uppercase flex items-center gap-1">
                        Edit <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
