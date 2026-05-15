import React from 'react';
import { UserRole, Language } from '../types';
import { translations } from '../translations';
import { Search, Home, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface RoleSelectionProps {
  onSelect: (role: UserRole) => void;
  language: Language;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect, language }) => {
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[#111827]">{t.select_role}</h1>
          <p className="text-[#6B7280] text-sm leading-relaxed">
            {t.role_description}
          </p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => onSelect('finder')}
            className="group relative flex items-center p-6 bg-white border-2 border-transparent hover:border-[#5469D4] rounded-2xl shadow-sm transition-all text-left"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-[#5469D4] group-hover:bg-[#5469D4] group-hover:text-white transition-colors">
              <Search className="w-7 h-7" />
            </div>
            <div className="ml-5 flex-1">
              <h3 className="font-bold text-lg text-[#111827]">{t.find_room}</h3>
              <p className="text-sm text-[#6B7280]">{t.finder}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#5469D4] transition-colors" />
          </button>

          <button
            onClick={() => onSelect('owner')}
            className="group relative flex items-center p-6 bg-white border-2 border-transparent hover:border-[#5469D4] rounded-2xl shadow-sm transition-all text-left"
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
              <Home className="w-7 h-7" />
            </div>
            <div className="ml-5 flex-1">
              <h3 className="font-bold text-lg text-[#111827]">{t.list_room_role}</h3>
              <p className="text-sm text-[#6B7280]">{t.owner}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#4F46E5] transition-colors" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
