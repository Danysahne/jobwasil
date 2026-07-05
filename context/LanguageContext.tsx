import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { strings, StringKey } from '@/constants/strings';

export type Lang = 'de' | 'ar';

const STORAGE_KEY = 'jobwasil.lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  isArabic: boolean;
  t: (key: StringKey) => string;
  hydrated: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'de',
  setLang: () => {},
  isArabic: false,
  t: (key) => strings.de[key],
  hydrated: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('de');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'de' || stored === 'ar') setLangState(stored);
      })
      .finally(() => setHydrated(true));
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(STORAGE_KEY, l).catch(() => {});
  };

  const t = (key: StringKey) => strings[lang][key];

  return (
    <LanguageContext.Provider value={{ lang, setLang, isArabic: lang === 'ar', t, hydrated }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
