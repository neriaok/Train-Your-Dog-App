import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../auth/supabaseClient';
import { uploadMedia } from '../auth/mediaUpload';

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
  const { isMock, user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    if (isMock) {
      AsyncStorage.getItem(STORAGE_KEY)
        .then(stored => setEntries(stored ? JSON.parse(stored) : []))
        .finally(() => setReady(true));
      return;
    }
    if (!user || !supabase) {
      setEntries([]);
      setReady(true);
      return;
    }
    supabase
      .from('journal_entries')
      .select('id, entry_date, media_url, media_type, note')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setEntries((data ?? []).map(row => ({
          id: row.id, date: row.entry_date, mediaUri: row.media_url, mediaType: row.media_type, note: row.note,
        })));
        setReady(true);
      });
  }, [isMock, user?.id]);

  const addEntry: JournalContextValue['addEntry'] = async (e) => {
    if (isMock) {
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
      return;
    }

    if (!user || !supabase) throw new Error('Not signed in');
    const mediaUrl = e.mediaUri && !e.mediaUri.startsWith('http')
      ? await uploadMedia(e.mediaUri, user.id, 'journal')
      : e.mediaUri;
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ user_id: user.id, media_url: mediaUrl, media_type: e.mediaType, note: e.note })
      .select('id, entry_date')
      .single();
    if (error) throw error;
    setEntries([{ id: data.id, date: data.entry_date, mediaUri: mediaUrl, mediaType: e.mediaType, note: e.note }, ...entries]);
  };

  const removeEntry = async (id: string) => {
    if (isMock) {
      const next = entries.filter(en => en.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setEntries(next);
      return;
    }
    if (!supabase) return;
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (error) throw error;
    setEntries(entries.filter(en => en.id !== id));
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
