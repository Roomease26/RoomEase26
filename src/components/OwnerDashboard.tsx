import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, Plus, Clock, MapPin, Check, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { City, Language, Area, Listing } from '../types';
import { translations } from '../translations';
import { areaService } from '../services/dataService';
import { Trash2, ExternalLink } from 'lucide-react';

interface Props {
  areas: Record<City, string[]>;
  rawAreas?: Area[];
  onRefreshAreas?: () => void;
  language: Language;
  onAddListing: (listing: any) => void;
  onDeleteListing: (id: string) => void;
  currentUserId: string;
  listings: Listing[];
}

export default function OwnerDashboard({ 
  areas, 
  rawAreas = [], 
  onRefreshAreas, 
  language, 
  onAddListing, 
  onDeleteListing, 
  currentUserId, 
  listings 
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'add' | 'manage'>('add');
  const [step, setStep] = useState<1 | 2>(1);
  const [searchArea, setSearchArea] = useState('');
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [city, setCity] = useState<City>('');
  const [area, setArea] = useState('');
  const [isNewCity, setIsNewCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [days, setDays] = useState('Mon–Sat');
  const [slots, setSlots] = useState('10 AM – 1 PM, 5 PM – 8 PM');
  const [status, setStatus] = useState<'Available Now' | 'Not Available'>('Available Now');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showAreaSuccessPopup, setShowAreaSuccessPopup] = useState(false);
  const [showAreaErrorPopup, setShowAreaErrorPopup] = useState(false);
  const [areaErrorMessage, setAreaErrorMessage] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [isCustomArea, setIsCustomArea] = useState(false);
  const [areaError, setAreaError] = useState('');
  const [lastAddedAreaId, setLastAddedAreaId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'loading' } | null>(null);
  
  const [cityAreas, setCityAreas] = useState<string[]>([]);

  const cities = Object.keys(areas).sort((a, b) => a.localeCompare(b));
  console.log("Available Cities:", cities);

  useEffect(() => {
    if (cities.length > 0 && (!city || !cities.includes(city))) {
      setCity(cities[0]);
    }
  }, [areas, city]);

  useEffect(() => {
    // 1. Log Dropdown areas prop for tracing
    console.log("Dropdown areas:", areas);

    // 2. Filter raw Firestore-loaded areas by selected city
    const firestoreLoaded = (rawAreas || [])
      .filter((a: Area) => a.city === city)
      .map((a: Area) => a.areaName);

    // 3. Clear/remove any overriding static lists and instead merge cleanly
    const firestoreKeyed = areas[city] || [];
    const uniqueAreas = new Set([
      ...firestoreLoaded,
      ...firestoreKeyed
    ]);

    const sorted = Array.from(uniqueAreas).sort((a, b) => a.localeCompare(b));
    setCityAreas(sorted);

    // 4. Log Selected City, Matching Areas Count, and Matching Areas Names
    console.log("Selected City:", city);
    console.log("Matching Areas Count:", sorted.length);
    console.log("Matching Areas Names:", sorted);
  }, [areas, rawAreas, city]);

  useEffect(() => {
    if (cityAreas.length > 0 && (!area || !cityAreas.includes(area))) {
      setArea(cityAreas[0]);
    }
  }, [cityAreas, area]);

  const t = translations[language];

  const showToast = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
    setToast({ message, type });
    if (type !== 'loading') {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const formatAreaName = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const validateAreaName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 3) return language === 'en' ? 'Minimum 3 characters required' : 'कम से कम 3 वर्ण आवश्यक हैं';
    if (trimmed.length > 40) return language === 'en' ? 'Maximum 40 characters allowed' : 'अधिकतम 40 वर्णों की अनुमति है';
    
    // Check for special characters
    if (/[@!$#%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmed)) {
      return language === 'en' ? 'Special characters not allowed' : 'विशेष वर्णों की अनुमति नहीं है';
    }
    
    // Check for URLs
    if (/\b(https?:\/\/[^\s]+|www\.[^\s]+|\w+\.(com|net|org|in|co|info|biz|io|xyz))\b/i.test(trimmed)) {
      return language === 'en' ? 'URLs are not allowed as area names' : 'क्षेत्र के नाम के रूप में यूआरएल की अनुमति नहीं है';
    }
    
    // Check for repetitive sequences (e.g., "aaaa" or "1111")
    if (/(.)\1{3,}/.test(trimmed)) {
      return language === 'en' ? 'Repetitive spam text is not allowed' : 'बार-बार आने वाले स्पैम पाठ की अनुमति नहीं है';
    }

    // Check for other obvious spam keywords
    const spamKeywords = ['test', 'fake', 'viagra', 'spam', 'casino', 'betting', 'earn money', 'free room'];
    const hasSpamKeyword = spamKeywords.some(keyword => trimmed.toLowerCase().includes(keyword));
    if (hasSpamKeyword) {
      return language === 'en' ? 'Inappropriate or spam text detected' : 'अनुचित या स्पैम पाठ का पता चला';
    }

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
    setLastAddedAreaId(null);
    if (!customArea.trim()) return;
    
    let targetCity = city;
    if (isNewCity) {
      if (!newCityName.trim()) {
        setAreaError(language === 'en' ? 'City name is required' : 'शहर का नाम आवश्यक है');
        return;
      }
      targetCity = formatAreaName(newCityName);
    }

    const formatted = formatAreaName(customArea);
    const errorMsg = validateAreaName(formatted);
    if (errorMsg) {
      setAreaError(errorMsg);
      return;
    }

    if (!isNewCity && cityAreas.includes(formatted)) {
      setAreaError(t.duplicate_area || (language === 'en' ? 'Area already exists in this city' : 'क्षेत्र पहले से मौजूद है'));
      return;
    }

    try {
      setLoading(true);
      const areaName = formatted;
      console.log("Saving area", { city: targetCity, areaName });
      showToast("Saving area...", "loading");

      // 1. Verify addDoc() is actually executed successfully by capturing the resulting ID
      const newAreaDocId = await areaService.addArea({
        city: targetCity,
        areaName
      });

      if (!newAreaDocId) {
        throw new Error('Firestore write did not return a valid document ID.');
      }

      setLastAddedAreaId(newAreaDocId);

      const docRef = { id: newAreaDocId };
      console.log("Area saved", docRef.id);

      // Immediately fetch all areas again and log
      const fetchedAreas = await areaService.getAllAreas();
      console.log("Areas after refresh", fetchedAreas);

      // Automatically refresh areas list in parent App component
      if (onRefreshAreas) {
        onRefreshAreas();
      }

      // Log selected city
      const selectedCity = targetCity;
      console.log("Current city filter", selectedCity);

      // Update local state only after successful verification of the write success
      if (targetCity === city) {
        setCityAreas(prev => {
          if (!prev.includes(formatted)) {
            return [...prev, formatted].sort((a, b) => a.localeCompare(b));
          }
          return prev;
        });
      } else {
        setCity(targetCity);
      }

      // - instantly close popup
      setShowAreaModal(false);
      setIsNewCity(false);
      setNewCityName('');
      console.log('[OwnerDashboard] Closed addition modal.');

      // - auto-select newly added area
      setArea(formatted);
      setCustomArea('');
      
      // show success toast and success popup
      showToast("Area saved successfully", "success");

      setShowAreaSuccessPopup(true);
      setTimeout(() => {
        setShowAreaSuccessPopup(false);
      }, 2500);

    } catch (error: any) {
      console.error("Firestore error", error);

      // 3. Extract exact Firestore error message
      let exactErrorMessage = error instanceof Error ? error.message : String(error);
      try {
        if (exactErrorMessage.startsWith('{')) {
          const parsed = JSON.parse(exactErrorMessage);
          exactErrorMessage = parsed.error || exactErrorMessage;
        }
      } catch (parseError) {
        // Fallback to original message string
      }

      if (exactErrorMessage.includes('Area already exists')) {
        exactErrorMessage = t.duplicate_area || 'Area already exists in this city';
      }

      showToast("Failed to save area", "error");

      setAreaError(exactErrorMessage);
      setAreaErrorMessage(exactErrorMessage);
      setShowAreaErrorPopup(true);
    } finally {
      // Ensure loading is stopped
      setLoading(false);
      console.log('[OwnerDashboard] Finished handleAddNewArea execution cycle.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) {
      alert(language === 'en' ? 'Please upload at least 1 photo' : language === 'hi' ? 'कृपया कम से कम 1 फोटो अपलोड करें' : 'कृपया किमान १ फोटो अपलोड करा');
      return;
    }

    setLoading(true);
    let finalArea = area;

    // If user is adding a custom area but didn't click the "Add" button
    if (isCustomArea && customArea.trim()) {
      const formatted = formatAreaName(customArea);
      const error = validateAreaName(formatted);
      if (error) {
        setAreaError(error);
        setLoading(false);
        return;
      }
      finalArea = formatted;
    }

    try {
      console.log('[OwnerDashboard] Submitting listing for area:', finalArea);
      await onAddListing({
        city,
        area: finalArea,
        address,
        landmark,
        availability: { days, slots, status },
        photos,
        createdAt: new Date().toISOString()
      });
      console.log('[OwnerDashboard] Listing created successfully');
      setShowSuccessPopup(true);
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
        setActiveSubTab('manage');
        setStep(1); // Reset step for next time
        setPhotos([]);
        setAddress('');
        setLandmark('');
      }, 2500);
      
    } catch (err) {
      console.error('[OwnerDashboard] Submission failed:', err);
      showToast('Failed to save listing. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return null; // Handle via popup now
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-24">
      <div className="max-w-md mx-auto p-6">
        {toast && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl text-white font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'success' ? 'bg-[#33CC66]' : toast.type === 'loading' ? 'bg-[#5469D4]' : 'bg-red-500'
          }`}>
            {toast.type === 'loading' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {toast.message}
          </div>
        )}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-8 text-center shadow-2xl max-w-xs w-full"
            >
              <div className="w-20 h-20 bg-[#33CC66] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1F36] mb-2 uppercase tracking-wide">
                {language === 'en' ? 'Success!' : 'सफल!'}
              </h2>
              <p className="text-[#697386] font-medium leading-relaxed">
                ✅ {language === 'en' ? 'Room listing added successfully' : 'रूम लिस्टिंग सफलतापूर्वक जोड़ी गई'}
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-[#33CC66] uppercase tracking-widest">
                <div className="w-3 h-3 border-2 border-[#33CC66] border-t-transparent rounded-full animate-spin"></div>
                Redirecting...
              </div>
            </motion.div>
          </div>
        )}

        {/* Custom Area Success Popup */}
        {showAreaSuccessPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-8 text-center shadow-2xl max-w-xs w-full"
            >
              <div className="w-20 h-20 bg-[#33CC66] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100 animate-bounce">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1F36] mb-2 uppercase tracking-wide">
                {language === 'en' ? 'Success!' : 'सफल!'}
              </h2>
              <p className="text-[#697386] font-medium leading-relaxed mb-4">
                ✅ {language === 'en' ? 'Area added successfully' : 'क्षेत्र सफलतापूर्वक जोड़ा गया'}
              </p>
              {lastAddedAreaId && (
                <div className="bg-[#F7F9FC] p-3 rounded-2xl border border-[#E3E8EE] flex flex-col items-center justify-center">
                  <span className="text-[9px] font-bold text-[#697386] uppercase tracking-wider mb-1">Firestore Doc ID</span>
                  <span className="text-[11px] font-mono font-medium text-[#1A1F36] break-all select-all">{lastAddedAreaId}</span>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Custom Area Error Popup */}
        {showAreaErrorPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-8 text-center shadow-2xl max-w-xs w-full"
            >
              <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-50">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1F36] mb-2 uppercase tracking-wide">
                {language === 'en' ? 'Error' : 'त्रुटि!'}
              </h2>
              <p className="text-[#697386] font-medium leading-relaxed mb-6">
                {areaErrorMessage}
              </p>
              <button
                onClick={() => setShowAreaErrorPopup(false)}
                className="w-full bg-[#1A1F36] text-white font-bold py-3 px-6 rounded-2xl hover:bg-black transition-colors"
              >
                {language === 'en' ? 'Close' : 'बंद करें'}
              </button>
            </motion.div>
          </div>
        )}
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
          <div className="space-y-6">
            {/* Step Indicators */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[#5469D4]' : 'bg-[#E3E8EE]'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[#5469D4]' : 'bg-[#E3E8EE]'}`} />
            </div>

            {step === 1 ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[12px] font-bold text-[#1A1F36] uppercase tracking-wider">
                      {language === 'en' ? 'Step 1: Upload Photos' : 'स्टेप 1: फोटो अपलोड करें'} (1-10)
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

                <button
                  onClick={() => {
                    if (photos.length === 0) {
                      showToast(language === 'en' ? 'Upload at least 1 photo' : 'कम से कम 1 फोटो अपलोड करें', 'error');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full sleek-btn-primary py-5 text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  {language === 'en' ? 'Next: Enter Details' : 'अगला: विवरण भरें'}
                </button>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Location */}
                  <div className="sleek-card p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#697386] uppercase">{t.select_city}</label>
                      <select 
                        value={city} 
                        onChange={(e) => {
                          const newCity = e.target.value as City;
                          console.log("Selected city:", newCity);
                          setCity(newCity);
                          // Clear search when switching cities
                          setSearchArea('');
                          const initialForNewCity = areas[newCity] || [];
                          setArea(initialForNewCity[0] || '');
                        }}
                        className="w-full sleek-input"
                      >
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5 relative">
                      <label className="text-[11px] font-bold text-[#697386] uppercase">{t.select_area}</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder={language === 'en' ? "Search area..." : "क्षेत्र खोजें..."}
                          className="w-full sleek-input"
                          value={searchArea}
                          onChange={(e) => setSearchArea(e.target.value)}
                        />
                        <select 
                          value={area} 
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              setShowAreaModal(true);
                            } else {
                              setArea(e.target.value);
                            }
                          }}
                          className="w-full sleek-input"
                        >
                          {cityAreas
                            .filter(a => a.toLowerCase().includes(searchArea.toLowerCase()))
                            .map(a => <option key={a} value={a}>{a}</option>)}
                          <option value="custom">+ {t.add_area}</option>
                        </select>
                        <button 
                          type="button"
                          onClick={() => {
                            setCustomArea('');
                            setAreaError('');
                            setShowAreaModal(true);
                          }}
                          className="text-[10px] font-bold text-[#5469D4] uppercase text-left hover:underline"
                        >
                          {t.area_not_found}
                        </button>

                        {/* Temporary Debug Box */}
                        <div id="area-loading-debug-box" className="p-4 bg-[#F4F6F8] rounded-2xl border border-[#D3DBE6] space-y-2 mt-2">
                          <h4 className="text-[10px] font-bold text-[#4F5B66] uppercase tracking-wider">🛠️ Area Loading Debugger</h4>
                          <div className="text-[11px] space-y-1 font-mono text-[#1A1F36]">
                            <div><strong className="text-[#697386]">Selected City:</strong> {city}</div>
                            <div><strong className="text-[#697386]">Areas Loaded:</strong> {cityAreas.length}</div>
                            <div className="max-h-24 overflow-y-auto bg-white p-2 rounded-lg border border-[#E3E8EE] break-words">
                              <strong className="text-[#697386] block mb-0.5">Loaded Areas:</strong>
                              {cityAreas.length > 0 ? cityAreas.join(', ') : 'No areas loaded.'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#697386] uppercase">{language === 'en' ? 'Address' : 'पता'}</label>
                      <textarea 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={language === 'en' ? 'Full address' : 'पूरा पता'}
                        className="w-full sleek-input min-h-[80px]"
                        required
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="sleek-card p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-[#5469D4]" />
                      <h3 className="font-bold text-[#1A1F36]">{language === 'en' ? 'Availability' : 'उपलब्धता'}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#697386] uppercase">Days</label>
                        <input value={days} onChange={(e) => setDays(e.target.value)} className="w-full sleek-input" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-[#697386] uppercase">Time</label>
                        <input value={slots} onChange={(e) => setSlots(e.target.value)} className="w-full sleek-input" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-white border-2 border-[#E3E8EE] py-4 rounded-2xl font-bold text-[#697386]"
                    >
                      {translations[language].back}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] sleek-btn-primary py-4 shadow-lg flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {language === 'en' ? 'Finish & List' : 'लिस्ट करें'}
                          <Check className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-[#E3E8EE]">
                <Plus className="w-10 h-10 text-[#697386] mx-auto mb-3 opacity-20" />
                <p className="text-[#697386] text-sm">No listings yet</p>
                <button onClick={() => setActiveSubTab('add')} className="mt-4 text-[#5469D4] font-bold">Add One Now</button>
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
                          if (confirm(language === 'en' ? 'Delete this listing?' : 'हटाएँ?')) {
                            onDeleteListing(item.id);
                          }
                        }}
                        className="bg-white/90 p-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#5469D4] uppercase tracking-wider mb-1">
                      <MapPin className="w-3 h-3" />
                      {item.city} • {item.area}
                    </div>
                    <h3 className="font-bold text-[#1A1F36] text-sm truncate">{item.address}</h3>
                    <div className="mt-3 pt-3 border-t border-[#E3E8EE] flex justify-between items-center text-[#697386]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">{item.availability.days}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold">{item.availability.status === 'Available Now' ? 'Live' : 'Hidden'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Area Modal */}
        {showAreaModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#1A1F36]">{t.add_area}</h3>
                <button onClick={() => {
                  setShowAreaModal(false);
                  setIsNewCity(false);
                  setNewCityName('');
                }}>
                  <X className="w-6 h-6 text-[#697386]" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-[#697386] uppercase tracking-wider">City</label>
                    <button
                      type="button"
                      onClick={() => setIsNewCity(!isNewCity)}
                      className="text-xs text-[#5469D4] font-bold hover:underline"
                    >
                      {isNewCity ? "Choose Existing" : "Add New City"}
                    </button>
                  </div>
                  {isNewCity ? (
                    <input
                      type="text"
                      placeholder="e.g. Nagpur"
                      value={newCityName}
                      onChange={(e) => {
                        setNewCityName(e.target.value);
                        setAreaError('');
                      }}
                      className={`w-full sleek-input ${areaError && !newCityName.trim() ? 'border-red-500' : ''}`}
                      autoFocus
                    />
                  ) : (
                    <div className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold text-[#1A1F36] border border-[#E3E8EE] flex justify-between items-center">
                      <span>{city || "No city selected"}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#697386] uppercase tracking-wider">{t.area_name}</label>
                  <input
                    type="text"
                    placeholder="e.g. Ram Nagar"
                    value={customArea}
                    onChange={(e) => {
                      setCustomArea(e.target.value);
                      setAreaError('');
                    }}
                    className={`w-full sleek-input ${areaError ? 'border-red-500' : ''}`}
                    autoFocus={!isNewCity}
                  />
                  {areaError && (
                    <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {areaError}
                    </p>
                  )}
                  <p className="text-[10px] text-[#697386] italic">{t.area_name_hint}</p>
                </div>

                <button
                  onClick={handleAddNewArea}
                  disabled={loading || !customArea.trim() || (isNewCity && !newCityName.trim())}
                  className="w-full sleek-btn-primary py-4 mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {t.add}
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
