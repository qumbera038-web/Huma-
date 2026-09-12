import React from 'react';
import { useLanguage } from "../../context/LanguageContext";
import { AppLanguage } from "../../utils/translations";
import { Languages } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: AppLanguage; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ur', label: 'اردو', flag: '🇵🇰' },
    { code: 'ps', label: 'پښتو', flag: '🇦🇫' },
    { code: 'mix', label: 'Mixed', flag: '🌐' },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition ${
            language === lang.code
              ? 'bg-sky-600 text-white'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
          title={lang.label}
        >
          <span>{lang.flag}</span>
          <span className="uppercase font-mono">{lang.code}</span>
        </button>
      ))}
    </div>
  );
};
