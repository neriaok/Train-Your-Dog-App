import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockLoadState, mockSignUp, mockSignIn, mockQuickSignIn, mockSignOut, mockSetPremium, MOCK_USER_ID } from './mockAuth';

export interface AppUser {
  id: string;
  email: string | null;
  name?: string;
}

interface AuthContextValue {
  ready: boolean;
  /** true when running on the local, no-backend mock account (see mockAuth.ts) */
  isMock: boolean;
  user: AppUser | null;
  isPremium: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Real backend only - redirects to Google, then back into the app once signed in. */
  signInWithGoogle: () => Promise<{ error: string | null }>;
  /** Mock mode only - one tap sign-in as the built-in "Neriaok" demo account, already premium. */
  quickSignIn: () => Promise<void>;
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
  signInWithGoogle: async () => ({ error: null }),
  quickSignIn: async () => {},
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
  const [mockName, setMockName] = useState<string | undefined>(undefined);
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

  const applyMockAccount = (account: { email: string; name?: string; isPremium: boolean } | null) => {
    setMockEmail(account?.email ?? null);
    setMockName(account?.name);
    setMockPremium(account?.isPremium ?? false);
  };

  useEffect(() => {
    if (isMock) {
      mockLoadState().then(({ signedIn, account }) => {
        setMockSignedIn(signedIn);
        applyMockAccount(account);
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
        applyMockAccount({ email, isPremium: false });
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
        const { account } = await mockLoadState();
        applyMockAccount(account);
      }
      return result;
    }
    if (!supabase) return { error: 'Accounts are not enabled yet' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async () => {
    if (isMock) return { error: 'Google sign-in needs the real backend configured first (see backend/supabase/README.md).' };
    if (!supabase) return { error: 'Accounts are not enabled yet' };
    // On web this navigates the whole page to Google and back - there is no
    // further branch to take here on success, the redirect just happens.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: Platform.OS === 'web' ? { redirectTo: window.location.origin } : undefined,
    });
    return { error: error?.message ?? null };
  };

  const quickSignIn = async () => {
    if (!isMock) return;
    await mockQuickSignIn();
    setMockSignedIn(true);
    const { account } = await mockLoadState();
    applyMockAccount(account);
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
    ? (mockSignedIn ? { id: MOCK_USER_ID, email: mockEmail, name: mockName } : null)
    : (session ? { id: session.user.id, email: session.user.email ?? null } : null);

  const isPremium = isMock ? mockPremium : (profile?.is_premium ?? false);

  return (
    <AuthContext.Provider
      value={{ ready, isMock, user, isPremium, signUp, signIn, signInWithGoogle, quickSignIn, signOut, upgradeToPremium, downgradeFromPremium }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
