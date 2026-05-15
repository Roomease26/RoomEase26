import React from 'react';
import { UserRole, Language } from '../types';
import { translations } from '../translations';
import { Search, Home, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface RoleSelectionProps {
  onSelect: (role: UserRole) => void;
  language: Language;
  loading?: boolean;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect, language, loading }) => {
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
            onClick={() => !loading && onSelect('finder')}
            disabled={loading}
            className={`group relative flex items-center p-6 bg-white border-2 border-transparent hover:border-[#5469D4] rounded-2xl shadow-sm transition-all text-left disabled:opacity-50 ${loading ? 'cursor-wait' : ''}`}
          >
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-[#5469D4] group-hover:bg-[#5469D4] group-hover:text-white transition-colors">
              <Search className="w-7 h-7" />
            </div>
            <div className="ml-5 flex-1">
              <h3 className="font-bold text-lg text-[#111827]">{t.find_room}</h3>
              <p className="text-sm text-[#6B7280]">{t.finder}</p>
            </div>
            {!loading && <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#5469D4] transition-colors" />}
          </button>

          <button
            onClick={() => !loading && onSelect('owner')}
            disabled={loading}
            className={`group relative flex items-center p-6 bg-white border-2 border-transparent hover:border-[#5469D4] rounded-2xl shadow-sm transition-all text-left disabled:opacity-50 ${loading ? 'cursor-wait' : ''}`}
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
              <Home className="w-7 h-7" />
            </div>
            <div className="ml-5 flex-1">
              <h3 className="font-bold text-lg text-[#111827]">{t.list_room_role}</h3>
              <p className="text-sm text-[#6B7280]">{t.owner}</p>
            </div>
            {!loading && <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#4F46E5] transition-colors" />}
          </button>
        </div>
        
        {loading && (
          <div className="flex flex-col items-center gap-3 mt-4">
            <div className="w-6 h-6 border-2 border-[#5469D4] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-[#5469D4] uppercase tracking-widest animate-pulse">Switching Role...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RoleSelection;
