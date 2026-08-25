import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'he' | 'en';

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

// Add new languages here later - the picker UI reads this list directly.
export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

const LANGUAGE_KEY = 'dogTrainingApp:language';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'he',
  setLanguage: () => {},
  isRTL: true,
  ready: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('he');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then(stored => {
        if (stored === 'he' || stored === 'en') setLanguageState(stored);
      })
      .finally(() => setReady(true));
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL: language === 'he', ready }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
