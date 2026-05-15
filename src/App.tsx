/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, UserProfile, Listing, City, Chat, Message, INITIAL_AREAS, PRICING } from './types';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import LanguageSelector from './components/LanguageSelector';
import Login from './components/Login';
import TermsAndConditions from './components/TermsAndConditions';
import CitySelector from './components/CitySelector';
import ListingList from './components/ListingList';
import Navigation from './components/Navigation';
import Profile from './components/Profile';
import OwnerDashboard from './components/OwnerDashboard';
import AdminPanel from './components/AdminPanel';
import ChatComponent from './components/Chat';
import PaymentModal from './components/PaymentModal';
import ImageGenerator from './components/ImageGenerator';
import SearchTab from './components/SearchTab';
import ErrorBoundary from './components/ErrorBoundary';
import { Search } from 'lucide-react';
import { translations } from './translations';
import { userService, listingService, paymentService } from './services/dataService';
import { isFirebaseConfigured } from './lib/firebase';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState<Language | null>(() => {
    const saved = localStorage.getItem('roomease_lang');
    return (saved as Language) || null;
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLocation, setSelectedLocation] = useState<{ city: City; area: string } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCity, setPaymentCity] = useState<City | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [areas, setAreas] = useState<Record<City, string[]>>(INITIAL_AREAS);
  const [listings, setListings] = useState<Listing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Sync language selection to localStorage
  useEffect(() => {
    if (language) {
      localStorage.setItem('roomease_lang', language);
    }
  }, [language]);

  // Listen to Listings
  useEffect(() => {
    const unsubscribe = listingService.listenToListings(setListings);
    return () => unsubscribe();
  }, []);

  // Listen to Profile if user is logged in
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = userService.listenToProfile(user.uid, (profile) => {
        if (profile) {
          setUser(profile);
          localStorage.setItem('roomease_user', JSON.stringify(profile));
        }
      });
      return () => unsubscribe();
    }
  }, [user?.uid]);

  // Handle high-level redirects
  useEffect(() => {
    console.log('[App] Route changed:', location.pathname);
    if (!language && location.pathname !== '/') {
      navigate('/');
    } else if (language && !user && !['/login', '/verify', '/'].includes(location.pathname)) {
      navigate('/login');
    }
  }, [language, user, location.pathname, navigate]);

  // Load session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('roomease_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (new Date(parsed.loginExpiry) > new Date()) {
        setUser(parsed);
      } else {
        localStorage.removeItem('roomease_user');
      }
    }

    const savedAreas = localStorage.getItem('roomease_areas');
    if (savedAreas) {
      setAreas(JSON.parse(savedAreas));
    }
  }, []);

  const handleLogin = async (phone: string) => {
    try {
      // In a real app, you'd use Firebase Auth, but here we use a custom UID based on phone
      const uid = 'u_' + phone; 
      let profile = await userService.getProfile(uid);
      
      if (!profile) {
        const loginExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
        const newUser: UserProfile = {
          uid,
          phone,
          role: phone === '9322646638' ? 'admin' : 'user',
          loginExpiry,
          acceptedTerms: false
        };
        await userService.createProfile(uid, newUser);
        profile = newUser;
      }

      setUser(profile);
      localStorage.setItem('roomease_user', JSON.stringify(profile));
    } catch (error) {
      console.error('[App] Login failed:', error);
      // Fallback for demo when Firebase is not configured
      const loginExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      const mockUser: UserProfile = {
        uid: 'u_' + phone,
        phone,
        role: phone === '9322646638' ? 'admin' : 'user',
        loginExpiry,
        acceptedTerms: false
      };
      setUser(mockUser);
      localStorage.setItem('roomease_user', JSON.stringify(mockUser));
    }
  };

  const handleAcceptTerms = async () => {
    if (user) {
      try {
        const updatedUser = { ...user, acceptedTerms: true };
        setUser(updatedUser);
        localStorage.setItem('roomease_user', JSON.stringify(updatedUser));
        await userService.updateProfile(user.uid, { acceptedTerms: true });
      } catch (error) {
        console.error('[App] Failed to update terms:', error);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('roomease_user');
  };

  const handlePaymentSuccess = async (details: any) => {
    if (user && paymentCity) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + PRICING.VALIDITY_DAYS);
      expiryDate.setHours(23, 59, 59, 999);
      
      const updatedCities = {
        ...(user.unlockedCities || {}),
        [paymentCity]: expiryDate.toISOString()
      };

      await userService.updateProfile(user.uid, {
        unlockedCities: updatedCities,
        paymentExpiry: expiryDate.toISOString()
      });

      await paymentService.recordPayment({
        userId: user.uid,
        amount: PRICING.UNLOCK_FEE,
        city: paymentCity,
        status: 'success',
        ...details
      });

      setIsPaymentModalOpen(false);
      setPaymentCity(null);
    }
  };

  const isCityPaid = (city: string) => {
    if (user?.role === 'admin') return true;
    if (!user?.unlockedCities) return false;
    const expiry = user.unlockedCities[city];
    if (!expiry) return false;
    return new Date(expiry) > new Date();
  };

  const handleAddListing = async (listing: Omit<Listing, 'id' | 'ownerUid'>) => {
    await listingService.createListing({
      ...listing,
      ownerUid: user?.uid || 'anonymous'
    });
    
    // Save new area if it doesn't exist locally for UI (would ideally sync from DB too)
    const city = listing.city as City;
    if (!areas[city].includes(listing.area)) {
      const updatedAreas = {
        ...areas,
        [city]: [...areas[city], listing.area]
      };
      setAreas(updatedAreas);
      localStorage.setItem('roomease_areas', JSON.stringify(updatedAreas));
    }
  };

  const t = language ? translations[language] : translations.en;

  const isPaid = user?.paymentExpiry ? new Date(user.paymentExpiry) > new Date() : false;

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        if (!selectedLocation) {
          return (
            <div className="space-y-6">
              <div className="px-6 pt-6">
                <div className="relative" onClick={() => setActiveTab('search')}>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#697386]" />
                  <input
                    type="text"
                    placeholder={t.search + "..."}
                    readOnly
                    className="w-full sleek-input pl-11 cursor-pointer"
                  />
                </div>
              </div>
              <CitySelector 
                areas={areas}
                language={language || 'en'}
                onSelect={(city, area) => setSelectedLocation({ city, area })} 
              />
            </div>
          );
        }
        return (
          <ListingList
            listings={listings.filter(l => l.city === selectedLocation.city && l.area === selectedLocation.area)}
            isPaid={isCityPaid(selectedLocation.city)}
            user={user}
            city={selectedLocation.city}
            area={selectedLocation.area}
            language={language || 'en'}
            onUnlock={() => {
              setPaymentCity(selectedLocation.city);
              setIsPaymentModalOpen(true);
            }}
            onChat={(listing) => {
              if (isCityPaid(listing.city)) {
                setActiveChat({ id: 'chat_1', listingId: listing.id, participants: [user!.uid, listing.ownerUid], updatedAt: new Date().toISOString() });
              } else {
                setPaymentCity(listing.city as City);
                setIsPaymentModalOpen(true);
              }
            }}
            onBack={() => setSelectedLocation(null)}
          />
        );
      case 'search':
        return (
          <SearchTab 
            listings={listings}
            user={user!}
            isCityPaid={isCityPaid}
            language={language || 'en'}
            onUnlock={(city) => {
              setPaymentCity(city as City);
              setIsPaymentModalOpen(true);
            }}
            onChat={(listing) => {
              if (isCityPaid(listing.city)) {
                setActiveChat({ id: 'chat_1', listingId: listing.id, participants: [user!.uid, listing.ownerUid], updatedAt: new Date().toISOString() });
              } else {
                setPaymentCity(listing.city as City);
                setIsPaymentModalOpen(true);
              }
            }}
          />
        );
      case 'add':
        return <OwnerDashboard areas={areas} language={language || 'en'} onAddListing={handleAddListing} />;
      case 'chats':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">{t.chats}</h2>
            {!isPaid ? (
              <div className="sleek-card p-8 text-center">
                <p className="text-[#697386] mb-6">
                  {language === 'en' ? 'Unlock premium to chat with room owners' : language === 'hi' ? 'रूम मालिकों के साथ चैट करने के लिए प्रीमियम अनलॉक करें' : 'खोली मालकांशी चॅट करण्यासाठी प्रीमियम अनलॉक करा'}
                </p>
                <button onClick={() => setIsPaymentModalOpen(true)} className="w-full sleek-btn-accent">
                  {t.unlock}
                </button>
              </div>
            ) : (
              <div className="text-[#697386] text-center mt-10">
                {language === 'en' ? 'No active chats yet' : language === 'hi' ? 'अभी तक कोई सक्रिय चैट नहीं' : 'अद्याप कोणतेही सक्रिय चॅट नाही'}
              </div>
            )}
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <Profile user={user!} language={language || 'en'} onLogout={handleLogout} />
            <div className="px-6 pb-24">
              <ImageGenerator />
            </div>
          </div>
        );
      case 'admin':
        if (user?.role !== 'admin') return null;
        return <AdminPanel />;
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F7F9FC]">
        {!isFirebaseConfigured && (
          <div className="bg-rose-500 text-white p-4 text-center font-bold text-sm shadow-lg sticky top-0 z-[100] animate-in slide-in-from-top duration-300">
            ⚠️ Firebase is not configured properly. Some features may not work. 
            Check your environment variables (VITE_FIREBASE_API_KEY, etc.)
          </div>
        )}
        <Routes>
          <Route 
            path="/" 
            element={!language ? <LanguageSelector onSelect={setLanguage} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" /> : (
                <div className="min-h-screen bg-[#E5E9F0]">
                  <div className="p-6 bg-[#5469D4] text-white text-center py-12 rounded-b-[40px] shadow-lg">
                    <h1 className="text-3xl font-extrabold mb-4">RoomEase</h1>
                    <p className="text-blue-100 text-sm max-w-xs mx-auto">
                      {t.welcome}
                    </p>
                  </div>
                  <Login onLogin={handleLogin} language={language || 'en'} />
                </div>
              )
            } 
          />

          <Route 
            path="/verify" 
            element={
              user ? <Navigate to="/dashboard" /> : (
                <div className="min-h-screen bg-[#E5E9F0]">
                  <div className="p-6 bg-[#5469D4] text-white text-center py-12 rounded-b-[40px] shadow-lg">
                    <h1 className="text-3xl font-extrabold mb-4">RoomEase</h1>
                    <p className="text-blue-100 text-sm max-w-xs mx-auto">
                      {t.welcome}
                    </p>
                  </div>
                  <Login onLogin={handleLogin} language={language || 'en'} />
                </div>
              )
            } 
          />

          <Route 
            path="/dashboard" 
            element={
              !user ? <Navigate to="/login" /> : (
                !user.acceptedTerms ? (
                  <TermsAndConditions onAccept={handleAcceptTerms} language={language || 'en'} />
                ) : (
                  <>
                    {renderContent()}
                    <Navigation 
                      activeTab={activeTab} 
                      onTabChange={setActiveTab} 
                      role={user.role} 
                      language={language || 'en'}
                    />
                  </>
                )
              )
            } 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {user && user.acceptedTerms && (
          <>
            <PaymentModal
              isOpen={isPaymentModalOpen}
              onClose={() => {
                setIsPaymentModalOpen(false);
                setPaymentCity(null);
              }}
              onSuccess={handlePaymentSuccess}
              userPhone={user.phone}
              language={language || 'en'}
              city={paymentCity || ''}
            />

            {activeChat && (
              <ChatComponent
                chatId={activeChat.id}
                currentUserId={user.uid}
                messages={messages}
                onSendMessage={(text) => setMessages([...messages, { id: 'msg_' + Date.now(), text, senderUid: user.uid, createdAt: new Date().toISOString() }])}
                onBack={() => setActiveChat(null)}
              />
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

