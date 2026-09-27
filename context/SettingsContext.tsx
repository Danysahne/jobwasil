import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'jobwasil.theme';

interface SettingsContextValue {
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  /** Effective scheme after resolving 'system' against the OS setting. */
  resolvedScheme: 'light' | 'dark';
  hydrated: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
  themeMode: 'system',
  setThemeMode: () => {},
  resolvedScheme: 'light',
  hydrated: false,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [hydrated, setHydrated] = useState(false);
  const systemScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'system' || stored === 'light' || stored === 'dark') {
          setThemeModeState(stored);
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  const setThemeMode = (m: ThemeMode) => {
    setThemeModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  };

  const resolvedScheme =
    themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;

  return (
    <SettingsContext.Provider value={{ themeMode, setThemeMode, resolvedScheme, hydrated }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
