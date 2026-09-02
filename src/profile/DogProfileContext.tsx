import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../auth/supabaseClient';
import { uploadMedia } from '../auth/mediaUpload';

export type AgeGroup = 'puppy' | 'adult' | 'senior';
export type Experience = 'beginner' | 'experienced';

export interface DogProfile {
  id: string;
  name: string;
  breed: string;
  photoUri: string | null;
  /** ISO yyyy-mm-dd, set once the first time a profile is saved. */
  startDate: string;
  ageGroup: AgeGroup | null;
  experience: Experience | null;
}

interface SaveProfileInput {
  name: string;
  breed: string;
  photoUri: string | null;
  ageGroup: AgeGroup | null;
  experience: Experience | null;
}

interface DogProfileContextValue {
  profiles: DogProfile[];
  /** The dog currently shown across the app (level select, journal, etc). */
  activeProfile: DogProfile | null;
  /** Alias for activeProfile - kept so existing single-dog call sites don't need to change. */
  profile: DogProfile | null;
  ready: boolean;
  setActiveId: (id: string) => void;
  /** Creates a new dog when `id` is omitted, otherwise updates that dog. */
  saveProfile: (p: SaveProfileInput, id?: string) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
}

const STORAGE_KEY = 'dogTrainingApp:dogProfiles';
const LEGACY_STORAGE_KEY = 'dogTrainingApp:dogProfile';
const ACTIVE_ID_KEY = 'dogTrainingApp:activeDogId';

const DogProfileContext = createContext<DogProfileContextValue>({
  profiles: [],
  activeProfile: null,
  profile: null,
  ready: false,
  setActiveId: () => {},
  saveProfile: async () => {},
  removeProfile: async () => {},
});

function newLocalId(): string {
  return `dog-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function DogProfileProvider({ children }: { children: ReactNode }) {
  const { isMock, user } = useAuth();
  const [profiles, setProfiles] = useState<DogProfile[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    if (isMock) {
      (async () => {
        const [storedList, storedActiveId, legacy] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ACTIVE_ID_KEY),
          AsyncStorage.getItem(LEGACY_STORAGE_KEY),
        ]);
        let list: DogProfile[] = storedList ? JSON.parse(storedList) : [];
        // One-time migration from the old single-profile storage shape.
        if (list.length === 0 && legacy) {
          const old = JSON.parse(legacy);
          list = [{ ...old, id: newLocalId() }];
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
        }
        setProfiles(list);
        setActiveIdState(storedActiveId && list.some(p => p.id === storedActiveId) ? storedActiveId : (list[0]?.id ?? null));
        setReady(true);
      })();
      return;
    }
    if (!user || !supabase) {
      setProfiles([]);
      setActiveIdState(null);
      setReady(true);
      return;
    }
    Promise.all([
      supabase
        .from('dog_profiles')
        .select('id, name, breed, photo_url, start_date, age_group, experience')
        .eq('user_id', user.id)
        .order('start_date'),
      AsyncStorage.getItem(ACTIVE_ID_KEY),
    ]).then(([{ data }, storedActiveId]) => {
      const list: DogProfile[] = (data ?? []).map(row => ({
        id: row.id, name: row.name, breed: row.breed, photoUri: row.photo_url, startDate: row.start_date,
        ageGroup: row.age_group ?? null, experience: row.experience ?? null,
      }));
      setProfiles(list);
      setActiveIdState(storedActiveId && list.some(p => p.id === storedActiveId) ? storedActiveId : (list[0]?.id ?? null));
      setReady(true);
    });
  }, [isMock, user?.id]);

  const setActiveId = (id: string) => {
    setActiveIdState(id);
    AsyncStorage.setItem(ACTIVE_ID_KEY, id);
  };

  const saveProfile = async (p: SaveProfileInput, id?: string) => {
    const existing = id ? profiles.find(pr => pr.id === id) : undefined;

    if (isMock) {
      const next: DogProfile = {
        id: id ?? newLocalId(),
        name: p.name,
        breed: p.breed,
        photoUri: p.photoUri,
        startDate: existing?.startDate ?? new Date().toISOString().slice(0, 10),
        ageGroup: p.ageGroup,
        experience: p.experience,
      };
      const nextList = id ? profiles.map(pr => (pr.id === id ? next : pr)) : [...profiles, next];
      // Write first so a failed save (e.g. a photo too large for storage)
      // never leaves the in-memory list showing data that wasn't persisted.
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
      setProfiles(nextList);
      if (!id) setActiveId(next.id);
      return;
    }

    if (!user || !supabase) throw new Error('Not signed in');
    // photoUri is either an https URL already stored in Supabase (unchanged
    // since last save) or a fresh local pick that still needs uploading -
    // local URIs never start with "http".
    const photoUrl = p.photoUri && !p.photoUri.startsWith('http')
      ? await uploadMedia(p.photoUri, user.id, 'profile')
      : p.photoUri;
    const startDate = existing?.startDate ?? new Date().toISOString().slice(0, 10);

    if (id) {
      const { error } = await supabase
        .from('dog_profiles')
        .update({ name: p.name, breed: p.breed, photo_url: photoUrl, age_group: p.ageGroup, experience: p.experience })
        .eq('id', id);
      if (error) throw error;
      const updated: DogProfile = { id, name: p.name, breed: p.breed, photoUri: photoUrl, startDate, ageGroup: p.ageGroup, experience: p.experience };
      setProfiles(profiles.map(pr => (pr.id === id ? updated : pr)));
    } else {
      const { data, error } = await supabase
        .from('dog_profiles')
        .insert({ user_id: user.id, name: p.name, breed: p.breed, photo_url: photoUrl, start_date: startDate, age_group: p.ageGroup, experience: p.experience })
        .select('id')
        .single();
      if (error) throw error;
      const created: DogProfile = { id: data.id, name: p.name, breed: p.breed, photoUri: photoUrl, startDate, ageGroup: p.ageGroup, experience: p.experience };
      setProfiles([...profiles, created]);
      setActiveId(created.id);
    }
  };

  const removeProfile = async (id: string) => {
    if (isMock) {
      const next = profiles.filter(pr => pr.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setProfiles(next);
      if (activeId === id) {
        if (next[0]) setActiveId(next[0].id);
        else { setActiveIdState(null); await AsyncStorage.removeItem(ACTIVE_ID_KEY); }
      }
      return;
    }
    if (!supabase) return;
    const { error } = await supabase.from('dog_profiles').delete().eq('id', id);
    if (error) throw error;
    const next = profiles.filter(pr => pr.id !== id);
    setProfiles(next);
    if (activeId === id) {
      if (next[0]) setActiveId(next[0].id);
      else { setActiveIdState(null); await AsyncStorage.removeItem(ACTIVE_ID_KEY); }
    }
  };

  const activeProfile = profiles.find(p => p.id === activeId) ?? null;

  return (
    <DogProfileContext.Provider value={{ profiles, activeProfile, profile: activeProfile, ready, setActiveId, saveProfile, removeProfile }}>
      {children}
    </DogProfileContext.Provider>
  );
}

export function useDogProfile() {
  return useContext(DogProfileContext);
}
