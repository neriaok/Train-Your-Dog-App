# Supabase - accounts & subscriptions backend

Supabase gives the app real user accounts (sign up / log in) and a place
to store who has an active premium subscription. Until you set this up,
the app runs in "no accounts" mode: everyone can play every level, exactly
like before - nothing changes on its own.

## One-time setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In your project, go to **SQL Editor**, paste the contents of
   `schema.sql` in this folder, and run it. That creates the `profiles`
   table (with `is_premium`) and wires it to auto-fill whenever someone
   signs up.
3. Go to **Settings -> API** and copy:
   - **Project URL**
   - **anon / public key**
4. Open `src/auth/supabaseClient.ts` in the app and fill in:
   ```ts
   export const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
   export const SUPABASE_ANON_KEY = 'your-anon-key';
   ```
   That's it - `AuthProvider` (`src/auth/AuthContext.tsx`) automatically
   switches from "no accounts" mode to real accounts once these are filled
   in, and the app gains a sign up / log in screen plus level-2+ gating for
   non-premium users.

## Testing premium without real payments

`is_premium` defaults to `false` for every new signup (free plan = level 1
only, matching what was agreed). To try the premium experience before
wiring up real payments: Supabase dashboard -> **Table Editor** ->
`profiles` -> find your row -> toggle `is_premium` to `true`. The app
picks it up next time it loads your profile (app restart, or sign out/in).

## Going live with real payments later

See `backend/payments-worker/README.md` - a Cloudflare Worker scaffold
that creates Stripe Checkout sessions and, on successful payment, flips
`is_premium` to `true` server-side (using the Supabase *service role* key,
which bypasses the row-level security policies above - never put that key
in the app itself). Also not deployed yet; same "fill in the config,
nothing else changes" pattern as `backend/agent-worker`.
