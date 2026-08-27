import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface Profile {
  id: string;
  email: string | null;
  is_premium: boolean;
}

interface AuthContextValue {
  ready: boolean;
  accountsEnabled: boolean;
  user: User | null;
  profile: Profile | null;
  isPremium: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  ready: true,
  accountsEnabled: false,
  user: null,
  profile: null,
  isPremium: true, // no accounts configured -> every level behaves as free/open
  signUp: async () => ({ error: 'Accounts are not enabled yet' }),
  signIn: async () => ({ error: 'Accounts are not enabled yet' }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const accountsEnabled = isSupabaseConfigured();
  const [ready, setReady] = useState(!accountsEnabled);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, email, is_premium')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as Profile);
  };

  useEffect(() => {
    if (!accountsEnabled || !supabase) return;

    supabase.auth.getSession()
      .then(({ data }) => {
        setSession(data.session);
        if (data.session) loadProfile(data.session.user.id);
      })
      .catch(() => {
        // Misconfigured URL/key or offline - fall through to ready below
        // so the app doesn't hang on a blank screen forever.
      })
      .finally(() => setReady(true));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) loadProfile(newSession.user.id);
      else setProfile(null);
    });

    return () => listener.subscription.unsubscribe();
  }, [accountsEnabled]);

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: 'Accounts are not enabled yet' };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Accounts are not enabled yet' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (session) await loadProfile(session.user.id);
  };

  const isPremium = accountsEnabled ? profile?.is_premium ?? false : true;

  return (
    <AuthContext.Provider
      value={{
        ready,
        accountsEnabled,
        user: session?.user ?? null,
        profile,
        isPremium,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
