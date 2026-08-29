import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DogProfile {
  name: string;
  breed: string;
  photoUri: string | null;
  /** ISO yyyy-mm-dd, set once the first time a profile is saved. */
  startDate: string;
}

interface DogProfileContextValue {
  profile: DogProfile | null;
  ready: boolean;
  saveProfile: (p: { name: string; breed: string; photoUri: string | null }) => Promise<void>;
}

const STORAGE_KEY = 'dogTrainingApp:dogProfile';

const DogProfileContext = createContext<DogProfileContextValue>({
  profile: null,
  ready: false,
  saveProfile: async () => {},
});

export function DogProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<DogProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(stored => { if (stored) setProfile(JSON.parse(stored)); })
      .finally(() => setReady(true));
  }, []);

  const saveProfile = async (p: { name: string; breed: string; photoUri: string | null }) => {
    const next: DogProfile = {
      name: p.name,
      breed: p.breed,
      photoUri: p.photoUri,
      startDate: profile?.startDate ?? new Date().toISOString().slice(0, 10),
    };
    // Write first so a failed save (e.g. a photo too large for storage)
    // never leaves the in-memory profile showing data that wasn't persisted.
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProfile(next);
  };

  return (
    <DogProfileContext.Provider value={{ profile, ready, saveProfile }}>
      {children}
    </DogProfileContext.Provider>
  );
}

export function useDogProfile() {
  return useContext(DogProfileContext);
}
