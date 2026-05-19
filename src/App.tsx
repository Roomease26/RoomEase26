/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  City, CITIES, INITIAL_AREAS, Language, UserProfile, Listing, Message, Chat, Area, UserRole, PRICING 
} from './types';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import LanguageSelector from './components/LanguageSelector';
import Login from './components/Login';
import RoleSelection from './components/RoleSelection';
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
import { userService, listingService, paymentService, areaService } from './services/dataService';
import { db, auth, isFirebaseConfigured } from './lib/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState<Language | null>(() => {
    const saved = localStorage.getItem('roomease_lang');
    return (saved as Language) || null;
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLocation, setSelectedLocation] = useState<{ city: City; area: string } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCity, setPaymentCity] = useState<City | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [areas, setAreas] = useState<Record<City, string[]>>(INITIAL_AREAS);
  const [rawAreas, setRawAreas] = useState<Area[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Session Restoration & Auth Listener
  useEffect(() => {
    console.log('[App] Initializing session restoration...');
    
    // Fallback for manual session restore if Firebase takes too long or is unconfigured
    const restoreManualSession = async () => {
      const savedUser = localStorage.getItem('roomease_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (new Date(parsed.loginExpiry) > new Date()) {
            console.log('[App] Restored manual session for:', parsed.phone);
            setUser(parsed);
          } else {
            localStorage.removeItem('roomease_user');
          }
        } catch (e) {
          console.error('[App] Failed to parse saved session:', e);
        }
      }
    };

    if (!isFirebaseConfigured || !auth) {
      restoreManualSession().finally(() => setIsInitialLoading(false));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('[App] Auth State Changed: USER FOUND', firebaseUser.uid);
          const profile = await userService.getProfile(firebaseUser.uid);
          if (profile) {
            setUser(profile);
            localStorage.setItem('roomease_user', JSON.stringify(profile));
            console.log('[App] Profile restored from Firestore');
          } else {
            // This might happen if user is authed but has no profile yet
            await restoreManualSession();
          }
        } else {
          console.log('[App] Auth State Changed: NO USER');
          await restoreManualSession();
        }
      } catch (err) {
        console.error('[App] Restoration error:', err);
        await restoreManualSession();
      } finally {
        setIsInitialLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync language selection to localStorage
  useEffect(() => {
    if (language) {
      localStorage.setItem('roomease_lang', language);
    }
  }, [language]);

  // Listen to Listings
  useEffect(() => {
    if (isInitialLoading) return;
    const unsubscribe = listingService.listenToListings(setListings);
    return () => unsubscribe();
  }, [isInitialLoading]);

  // Listen to Areas
  useEffect(() => {
    if (isInitialLoading) return;
    const unsubscribe = areaService.listenToAreas((fetchedAreas) => {
      setRawAreas(fetchedAreas);
      // Create a fresh copy of INITIAL_AREAS
      const mergedAreas: Record<City, string[]> = {} as any;
      (Object.keys(INITIAL_AREAS) as City[]).forEach(city => {
        mergedAreas[city] = [...INITIAL_AREAS[city]];
      });

      fetchedAreas.forEach(a => {
        if (mergedAreas[a.city] && !mergedAreas[a.city].includes(a.areaName)) {
          mergedAreas[a.city] = [...mergedAreas[a.city], a.areaName];
        }
      });
      setAreas(mergedAreas);
      localStorage.setItem('roomease_areas', JSON.stringify(mergedAreas));
    });
    return () => unsubscribe();
  }, [isInitialLoading]);

  // Handle Onboarding Flow & Redirects
  useEffect(() => {
    if (isInitialLoading) return;

    const path = location.pathname;

    // 1. Not Logged In
    if (!user) {
      if (path !== '/login' && path !== '/verify') {
        console.log('[App] Guard: Redirecting to login');
        navigate('/login', { replace: true });
      }
      return;
    }

    // 2. Language Selection
    if (!language) {
      if (path !== '/') {
        console.log('[App] Guard: Redirecting to language selection');
        navigate('/', { replace: true });
      }
      return;
    }

    // 3. Terms & Conditions
    if (!user.acceptedTerms) {
      if (path !== '/dashboard') { // Dashboard handles Terms UI globally or we could have a route
         // Current App structure shows Terms inside /dashboard if !acceptedTerms
         if (path !== '/dashboard') navigate('/dashboard', { replace: true });
      }
      return;
    }

    // 4. Role Selection
    if (!user.roleChosen) {
      if (path !== '/role-selection') {
        console.log('[App] Guard: Redirecting to role selection');
        navigate('/role-selection', { replace: true });
      }
      return;
    }

    // 5. Normal Dashboard (Redirect if on onboarding pages but everything is ready)
    if (['/login', '/verify', '/'].includes(path) && language && user.acceptedTerms && user.roleChosen) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, language, isInitialLoading, location.pathname, navigate]);

  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (phone: string) => {
    try {
      console.log('[App] Handling login for:', phone);
      // 1. Authenticate with Firebase if configured
      let uid = 'u_' + phone; // Fallback
      if (isFirebaseConfigured && auth) {
        try {
          const authCredential = await signInAnonymously(auth);
          uid = authCredential.user.uid;
          console.log('[App] Firebase Anonymous Auth Success:', uid);
        } catch (authErr) {
          console.warn('[App] Auth failed, continuing with manual UID:', authErr);
        }
      }

      // 2. Try to find profile by phone first
      let profile = await userService.getProfileByPhone(phone);
      const now = new Date().toISOString();
      const loginExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      
      if (!profile) {
        console.log('[App] Creating new profile for:', phone);
        const newUser: UserProfile = {
          uid,
          phone,
          role: 'finder',
          roleChosen: false, 
          loginExpiry,
          acceptedTerms: false,
          language: language || 'en',
          loginTime: now,
          lastActive: now,
          subscriptionStatus: 'none',
          subscriptionActive: false,
          expiryDate: '',
          selectedCity: selectedLocation?.city
        };
        await userService.createProfile(uid, newUser);
        profile = newUser;
      } else {
        console.log('[App] Updating existing profile for:', phone);
        const updates: Partial<UserProfile> = {
          uid, 
          loginTime: now,
          lastActive: now,
          loginExpiry
        };
        await userService.updateProfile(profile.uid, updates);
        profile = { ...profile, ...updates };
      }

      setUser(profile);
      localStorage.setItem('roomease_user', JSON.stringify(profile));
      showToast(language === 'en' ? 'Welcome back!' : 'वापसी पर स्वागत है!', 'success');
      
    } catch (error) {
      console.error('[App] Login failed:', error);
      // Fallback
      const loginExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      const mockUser: UserProfile = {
        uid: 'u_' + phone,
        phone,
        role: 'finder',
        roleChosen: false,
        loginExpiry,
        acceptedTerms: false,
        language: language || 'en',
        subscriptionStatus: 'none'
      };
      setUser(mockUser);
      localStorage.setItem('roomease_user', JSON.stringify(mockUser));
      showToast('Offline login successful', 'success');
    }
  };

  const handleAcceptTerms = async () => {
    if (user) {
      try {
        const updatedUser = { ...user, acceptedTerms: true };
        setUser(updatedUser);
        localStorage.setItem('roomease_user', JSON.stringify(updatedUser));
        await userService.updateProfile(user.uid, { acceptedTerms: true });
        showToast(language === 'en' ? 'Terms accepted' : 'नियम स्वीकार किए गए');
      } catch (error) {
        console.error('[App] Failed to update terms:', error);
        showToast('Failed to save terms', 'error');
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

  const handleRoleSelect = async (role: UserRole) => {
    if (!user || isSwitchingRole) return;
    
    console.log('[App] Selecting role:', role);
    setIsSwitchingRole(true);
    
    try {
      const updates = { 
        role, 
        roleChosen: true,
        // Auto-admin for specific phone
        ...(user.phone === '9322646638' ? { role: 'admin' as UserRole } : {})
      };
      
      await userService.updateProfile(user.uid, updates);
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('roomease_user', JSON.stringify(updatedUser));
      
      showToast(language === 'en' ? '✅ Role saved successfully' : '✅ भूमिका सुरक्षित हो गई');
      
      // Delay navigation slightly to let state propagate and show toast
      setTimeout(() => {
        setIsSwitchingRole(false);
        setActiveTab(role === 'owner' || role === 'admin' ? 'add' : 'home');
        // Navigation will be handled by the onboarding useEffect guard
        console.log('[App] Role selection complete, navigating to dashboard...');
        navigate('/dashboard', { replace: true });
      }, 800);

    } catch (error: any) {
      setIsSwitchingRole(false);
      console.error('[App] Role selection ERROR:', error);
      showToast(language === 'en' ? 'Failed to save role.' : 'भूमिका सुरक्षित करने में विफल।', 'error');
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
    const listingId = await listingService.createListing({
      ...listing,
      ownerUid: user?.uid || 'anonymous'
    });
    console.log('[App] Listing created with ID:', listingId);
    
    // Save new area if it doesn't exist in our merged list
    const city = listing.city as City;
    if (!areas[city].includes(listing.area)) {
      console.log('[App] Auto-adding new area to Firestore:', listing.area);
      
      // Optimistic update
      const updatedAreas = {
        ...areas,
        [city]: [...areas[city], listing.area]
      };
      setAreas(updatedAreas);

      try {
        await areaService.addArea({
          city,
          areaName: listing.area,
          createdBy: user?.uid || 'anonymous',
          createdAt: new Date().toISOString()
        });
      } catch (err: any) {
        if (err.message !== 'Area already exists in this city') {
          console.error('[App] Failed to auto-save area:', err);
        }
      }
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      await listingService.deleteListing(listingId);
    } catch (error) {
      console.error('[App] Failed to delete listing:', error);
    }
  };

  const t = language ? translations[language] : translations.en;

  const isPaid = user?.paymentExpiry ? new Date(user.paymentExpiry) > new Date() : false;

  const handleSelectLocation = async (city: City, areaName: string) => {
    const formatted = areaName.toLowerCase().trim().split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    setSelectedLocation({ city, area: formatted });
    
    if (!areas[city].includes(formatted)) {
      console.log('[App] Saving custom search area:', formatted);
      
      // Optimistic update
      const updatedAreas = {
        ...areas,
        [city]: [...areas[city], formatted]
      };
      setAreas(updatedAreas);

      try {
        await areaService.addArea({
          city,
          areaName: formatted,
          createdBy: user?.uid || 'anonymous',
          createdAt: new Date().toISOString()
        });
      } catch (err: any) {
        if (err.message !== 'Area already exists in this city') {
          console.error('[App] Search area save error:', err);
        }
      }
    }
  };

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
                onSelect={handleSelectLocation} 
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
            areas={areas}
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
        if (user?.role === 'owner' || user?.role === 'admin') {
          return (
            <OwnerDashboard 
              areas={areas} 
              language={language || 'en'} 
              onAddListing={handleAddListing} 
              onDeleteListing={handleDeleteListing}
              currentUserId={user?.uid || ''}
              listings={listings.filter(l => l.ownerUid === user?.uid)}
            />
          );
        }
        return (
          <div className="p-6 text-center mt-20">
            <p className="text-gray-500">{language === 'en' ? 'Only owners can list rooms.' : 'केवल मालिक ही कमरे सूचीबद्ध कर सकते हैं।'}</p>
            <button 
              onClick={() => navigate('/role-selection')}
              className="mt-4 text-[#5469D4] font-bold"
            >
              {language === 'en' ? 'Switch to Owner Role' : 'मालिक भूमिका पर स्विच करें'}
            </button>
          </div>
        );
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
            <Profile 
              user={user!} 
              language={language || 'en'} 
              onLogout={handleLogout} 
              onSwitchRole={() => navigate('/role-selection')}
            />
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

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-[#5469D4]/20 border-t-[#5469D4] rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-[#1A1F36] mb-2 tracking-tight">RoomEase</h2>
        <p className="text-[#697386] text-sm animate-pulse">Restoring session...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F7F9FC]">
        {toast && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-xl text-white font-bold text-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'success' ? 'bg-[#33CC66]' : 'bg-red-500'
          }`}>
            {toast.message}
          </div>
        )}
        <Routes>
          <Route 
            path="/" 
            element={language ? <Navigate to="/dashboard" /> : <LanguageSelector onSelect={setLanguage} />} 
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
            element={<Navigate to="/login" />} 
          />

          <Route 
            path="/role-selection" 
            element={
              !user ? <Navigate to="/login" /> : (
                <RoleSelection 
                  language={language || 'en'} 
                  onSelect={handleRoleSelect} 
                  loading={isSwitchingRole}
                />
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

