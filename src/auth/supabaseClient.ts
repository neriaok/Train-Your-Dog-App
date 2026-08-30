import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Fill these in from your Supabase project (Settings -> API) to switch the
 * app over to real accounts. Leave empty to keep the app in "no accounts"
 * mode, where every level behaves as if it were free (see
 * src/auth/AuthContext.tsx) - nothing breaks either way.
 * Setup steps: backend/supabase/README.md
 */
export const SUPABASE_URL = 'https://zvjtwlmjmxkdzvhekkvx.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_YQt6JZGO1-B2ApX3zIr3Dw_W3dppevN';

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.trim().length > 0 && SUPABASE_ANON_KEY.trim().length > 0;
}

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // Needed on web so the client picks up the session Supabase leaves
        // in the URL after redirecting back from an OAuth provider (see
        // AuthContext.signInWithGoogle). A no-op on native, which never
        // gets a URL fragment to detect.
        detectSessionInUrl: true,
      },
    })
  : null;
