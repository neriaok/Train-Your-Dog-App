import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../auth/supabaseClient';
import { uploadMedia } from '../auth/mediaUpload';

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
  const { isMock, user } = useAuth();
  const [profile, setProfile] = useState<DogProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    if (isMock) {
      AsyncStorage.getItem(STORAGE_KEY)
        .then(stored => setProfile(stored ? JSON.parse(stored) : null))
        .finally(() => setReady(true));
      return;
    }
    if (!user || !supabase) {
      setProfile(null);
      setReady(true);
      return;
    }
    supabase
      .from('dog_profiles')
      .select('name, breed, photo_url, start_date')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data ? { name: data.name, breed: data.breed, photoUri: data.photo_url, startDate: data.start_date } : null);
        setReady(true);
      });
  }, [isMock, user?.id]);

  const saveProfile = async (p: { name: string; breed: string; photoUri: string | null }) => {
    if (isMock) {
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
      return;
    }

    if (!user || !supabase) throw new Error('Not signed in');
    // photoUri is either an https URL already stored in Supabase (unchanged
    // since last save) or a fresh local pick that still needs uploading -
    // local URIs never start with "http".
    const photoUrl = p.photoUri && !p.photoUri.startsWith('http')
      ? await uploadMedia(p.photoUri, user.id, 'profile')
      : p.photoUri;
    const startDate = profile?.startDate ?? new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from('dog_profiles')
      .upsert({ user_id: user.id, name: p.name, breed: p.breed, photo_url: photoUrl, start_date: startDate });
    if (error) throw error;
    setProfile({ name: p.name, breed: p.breed, photoUri: photoUrl, startDate });
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
