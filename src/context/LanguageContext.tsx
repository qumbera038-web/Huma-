import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage } from '../utils/translations';
import { t as translateFunction } from '../utils/translations';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: keyof typeof translateFunction extends (infer U) ? Parameters<typeof translateFunction>[0] : never) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    const stored = localStorage.getItem('pos_language') as AppLanguage;
    if (stored && ['en', 'ur', 'ps'].includes(stored)) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('pos_language', lang);
  };

  const t = (key: Parameters<typeof translateFunction>[0]) => translateFunction(key, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
