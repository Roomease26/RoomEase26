import React from 'react';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { Language, UserRole } from '../types';
import { translations } from '../translations';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: UserRole;
  language: Language;
}

export default function Navigation({ activeTab, onTabChange, role, language }: Props) {
  const t = translations[language];
  
  const tabs = [
    { id: 'home', icon: Home, label: t.home || 'Home' },
  ];

  if (role === 'owner') {
    tabs.push({ id: 'add', icon: PlusCircle, label: t.list_room_role });
  } else {
    tabs.push({ id: 'search', icon: Search, label: t.search || 'Search' });
  }

  tabs.push(
    { id: 'chats', icon: MessageCircle, label: t.chats || 'Chats' },
    { id: 'profile', icon: User, label: t.profile || 'Profile' }
  );

  if (role === 'admin') {
    tabs.push({ id: 'admin', icon: User, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E3E8EE] px-6 py-3 pb-8 flex justify-between items-center z-40">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activeTab === tab.id ? "text-[#5469D4]" : "text-[#697386]"
          )}
        >
          <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "stroke-[2.5px]" : "stroke-[2px]")} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
