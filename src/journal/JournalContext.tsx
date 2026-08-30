import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface JournalEntry {
  id: string;
  date: string; // ISO yyyy-mm-dd
  mediaUri: string | null;
  mediaType: 'photo' | 'video' | null;
  note: string;
}

interface JournalContextValue {
  entries: JournalEntry[];
  ready: boolean;
  addEntry: (e: { mediaUri: string | null; mediaType: 'photo' | 'video' | null; note: string }) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

const STORAGE_KEY = 'dogTrainingApp:journal';

const JournalContext = createContext<JournalContextValue>({
  entries: [],
  ready: false,
  addEntry: async () => {},
  removeEntry: async () => {},
});

export function JournalProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(stored => { if (stored) setEntries(JSON.parse(stored)); })
      .finally(() => setReady(true));
  }, []);

  const addEntry: JournalContextValue['addEntry'] = async (e) => {
    const entry: JournalEntry = {
      id: `${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      mediaUri: e.mediaUri,
      mediaType: e.mediaType,
      note: e.note,
    };
    const next = [entry, ...entries];
    // Write first so a failed save (e.g. a video too large for local
    // storage) never leaves the list showing an entry that wasn't persisted.
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setEntries(next);
  };

  const removeEntry = async (id: string) => {
    const next = entries.filter(e => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setEntries(next);
  };

  return (
    <JournalContext.Provider value={{ entries, ready, addEntry, removeEntry }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  return useContext(JournalContext);
}
