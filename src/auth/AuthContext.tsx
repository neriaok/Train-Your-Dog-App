import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockLoadState, mockSignUp, mockSignIn, mockSignOut, mockSetPremium, MOCK_USER_ID } from './mockAuth';

export interface AppUser {
  id: string;
  email: string | null;
}

interface AuthContextValue {
  ready: boolean;
  /** true when running on the local, no-backend mock account (see mockAuth.ts) */
  isMock: boolean;
  user: AppUser | null;
  isPremium: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** Mock mode only - simulates a successful purchase, no real charge. */
  upgradeToPremium: () => Promise<void>;
  /** Mock mode only - lets you flip back to the free plan to re-test the paywall. */
  downgradeFromPremium: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  ready: false,
  isMock: true,
  user: null,
  isPremium: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  upgradeToPremium: async () => {},
  downgradeFromPremium: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const isMock = !isSupabaseConfigured();
  const [ready, setReady] = useState(false);

  // Real (Supabase) state
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ is_premium: boolean } | null>(null);

  // Mock state
  const [mockSignedIn, setMockSignedIn] = useState(false);
  const [mockEmail, setMockEmail] = useState<string | null>(null);
  const [mockPremium, setMockPremium] = useState(false);

  const loadProfile = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, email, is_premium')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as { is_premium: boolean });
  };

  useEffect(() => {
    if (isMock) {
      mockLoadState().then(({ signedIn, account }) => {
        setMockSignedIn(signedIn);
        setMockEmail(account?.email ?? null);
        setMockPremium(account?.isPremium ?? false);
        setReady(true);
      });
      return;
    }

    if (!supabase) return;

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
  }, [isMock]);

  const signUp = async (email: string, password: string) => {
    if (isMock) {
      const result = await mockSignUp(email, password);
      if (!result.error) {
        setMockSignedIn(true);
        setMockEmail(email);
        setMockPremium(false);
      }
      return result;
    }
    if (!supabase) return { error: 'Accounts are not enabled yet' };
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    if (isMock) {
      const result = await mockSignIn(email, password);
      if (!result.error) {
        setMockSignedIn(true);
        setMockEmail(email);
        const { account } = await mockLoadState();
        setMockPremium(account?.isPremium ?? false);
      }
      return result;
    }
    if (!supabase) return { error: 'Accounts are not enabled yet' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (isMock) {
      await mockSignOut();
      setMockSignedIn(false);
      return;
    }
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const upgradeToPremium = async () => {
    if (!isMock) return;
    await mockSetPremium(true);
    setMockPremium(true);
  };

  const downgradeFromPremium = async () => {
    if (!isMock) return;
    await mockSetPremium(false);
    setMockPremium(false);
  };

  const user: AppUser | null = isMock
    ? (mockSignedIn ? { id: MOCK_USER_ID, email: mockEmail } : null)
    : (session ? { id: session.user.id, email: session.user.email ?? null } : null);

  const isPremium = isMock ? mockPremium : (profile?.is_premium ?? false);

  return (
    <AuthContext.Provider
      value={{ ready, isMock, user, isPremium, signUp, signIn, signOut, upgradeToPremium, downgradeFromPremium }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
