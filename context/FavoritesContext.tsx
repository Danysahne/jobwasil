import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'jobwasil.favorites';

export interface FavoriteJob {
  /** hashId || refnr — must match the id used for /job/[id] routing. */
  id: string;
  titel: string;
  titelAr?: string;
  arbeitgeber?: string;
  ort?: string;
  beruf?: string;
  savedAt: number;
}

interface FavoritesContextValue {
  favorites: FavoriteJob[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (job: FavoriteJob) => void;
  hydrated: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  hydrated: false,
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteJob[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setFavorites(parsed);
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  const persist = (next: FavoriteJob[]) => {
    setFavorites(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const isFavorite = (id: string) => favorites.some((f) => f.id === id);

  const toggleFavorite = (job: FavoriteJob) => {
    persist(
      isFavorite(job.id)
        ? favorites.filter((f) => f.id !== job.id)
        : [{ ...job, savedAt: Date.now() }, ...favorites],
    );
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, hydrated }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
