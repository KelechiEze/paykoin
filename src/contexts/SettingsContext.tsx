import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyType = 'usd' | 'eur' | 'gbp' | 'jpy';
export type LanguageType = 'english' | 'spanish' | 'french' | 'german' | 'japanese';

interface SettingsContextType {
  darkMode: boolean;
  language: LanguageType;
  currency: CurrencyType;
  setDarkMode: (value: boolean) => void;
  setLanguage: (value: LanguageType) => void;
  setCurrency: (value: CurrencyType) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem('darkMode') === 'true'
  );
  const [language, setLanguage] = useState<LanguageType>(
    (localStorage.getItem('language') as LanguageType) || 'english'
  );
  const [currency, setCurrency] = useState<CurrencyType>(
    (localStorage.getItem('currency') as CurrencyType) || 'usd'
  );

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Store language in localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Store currency in localStorage
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  return (
    <SettingsContext.Provider 
      value={{ 
        darkMode, 
        language, 
        currency, 
        setDarkMode, 
        setLanguage, 
        setCurrency 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
