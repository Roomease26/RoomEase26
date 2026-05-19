import React from 'react';
import { User, LogOut, CreditCard, Instagram, Shield, Phone, ScrollText } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { translations } from '../translations';

interface Props {
  user: UserProfile;
  language: Language;
  onLogout: () => void;
}

export default function Profile({ user, language, onLogout }: Props) {
  const activeCities = Object.entries(user.unlockedCities || {}).filter(([_, expiry]) => new Date(expiry) > new Date());
  const isPaid = activeCities.length > 0 || user.role === 'admin';
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 pb-24">
      <div className="max-w-md mx-auto">
        <header className="mb-8 text-center">
          <div className="w-20 h-20 bg-[#EBF1FF] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sleek">
            <User className="w-10 h-10 text-[#5469D4]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1F36]">{user.phone}</h1>
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="sleek-tag">{user.role === 'admin' ? 'Admin' : 'User'}</div>
          </div>
        </header>

        <div className="space-y-4">
          {/* Subscription Status */}
          <div className="sleek-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-[#1A1F36] text-sm">{language === 'en' ? 'Account Status' : language === 'hi' ? 'खाते की स्थिति' : 'खाते स्थिती'}</h3>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                isPaid ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {isPaid ? 'Premium' : 'Free'}
              </span>
            </div>
            {isPaid ? (
              <p className="text-[13px] text-[#697386]">
                {language === 'en' ? 'You have active city access' : language === 'hi' ? 'आपके पास सक्रिय शहर एक्सेस है' : 'तुमच्याकडे सक्रिय शहर ॲक्सेस आहे'}
              </p>
            ) : (
              <p className="text-[13px] text-[#697386]">
                {language === 'en' ? 'Unlock city access to see room details and chat with owners.' : language === 'hi' ? 'कमरे का विवरण देखने और मालिकों के साथ चैट करने के लिए शहर एक्सेस अनलॉक करें।' : 'खोलीचे तपशील पाहण्यासाठी आणि मालकांशी चॅट करण्यासाठी शहर ॲक्सेस अनलॉक करा.'}
              </p>
            )}
          </div>

          {/* Active City Subscriptions */}
          {activeCities.length > 0 && (
            <div className="sleek-card p-6">
              <h3 className="font-bold text-[#1A1F36] text-sm mb-4">
                {language === 'en' ? 'Active City Access' : language === 'hi' ? 'सक्रिय शहर एक्सेस' : 'सक्रिय शहर ॲक्सेस'}
              </h3>
              <div className="space-y-3">
                {activeCities.map(([city, expiry]) => (
                  <div key={city} className="flex items-center justify-between p-3 bg-[#F7F9FC] rounded-xl border border-[#E3E8EE]">
                    <div>
                      <p className="font-bold text-xs text-[#1A1F36]">{city}</p>
                      <p className="text-[10px] text-[#697386]">
                        {language === 'en' ? 'Expires' : language === 'hi' ? 'समाप्त' : 'संपेल'}: {new Date(expiry).toLocaleDateString()} {new Date(expiry).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-wider">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Support */}
          <a 
            href="https://instagram.com/RoomEase" 
            target="_blank" 
            rel="noopener noreferrer"
            className="sleek-card p-6 flex items-center justify-between group hover:border-[#E1306C] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center group-hover:bg-[#E1306C] transition-colors">
                <Instagram className="w-5 h-5 text-[#E1306C] group-hover:text-white" />
              </div>
              <div>
                <p className="font-bold text-[#1A1F36] text-sm">{language === 'en' ? 'Follow us' : language === 'hi' ? 'हमें फ़ॉलो करें' : 'आम्हाला फॉलो करा'}</p>
                <p className="text-[11px] text-[#697386]">@RoomEase on Instagram</p>
              </div>
            </div>
            <span className="text-[#E1306C] font-bold text-xs">{language === 'en' ? 'Follow' : language === 'hi' ? 'फ़ॉलो करें' : 'फॉलो करा'}</span>
          </a>

          {/* Settings */}
          <div className="sleek-card overflow-hidden">
            <button className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-all border-b border-[#E3E8EE] text-sm text-[#1A1F36]">
              <Shield className="w-4 h-4 text-[#697386]" />
              <span className="font-medium">{language === 'en' ? 'Privacy Policy' : language === 'hi' ? 'गोपनीयता नीति' : 'गोपनीयता धोरण'}</span>
            </button>
            <button className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-all border-b border-[#E3E8EE] text-sm text-[#1A1F36]">
              <ScrollText className="w-4 h-4 text-[#697386]" />
              <span className="font-medium">{language === 'en' ? 'Terms & Conditions' : language === 'hi' ? 'नियम और शर्तें' : 'नियम आणि अटी'}</span>
            </button>
            <button className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-all border-b border-[#E3E8EE] text-sm text-[#1A1F36]">
              <Phone className="w-4 h-4 text-[#697386]" />
              <span className="font-medium">{language === 'en' ? 'Contact Support' : language === 'hi' ? 'समर्थन से संपर्क करें' : 'सपोर्टशी संपर्क साधा'}</span>
            </button>
            <button 
              onClick={onLogout}
              className="w-full p-4 flex items-center gap-4 hover:bg-red-50 transition-all text-red-600 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-bold">{language === 'en' ? 'Logout' : language === 'hi' ? 'लॉगआउट' : 'लॉगआउट'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
