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

## Syncing dog profiles, journal, and progress across devices

`schema.sql` alone only sets up accounts/subscriptions. To also store dog
profiles, journal entries, and level progress in Supabase instead of only
the browser's local storage, run these files too, **in this exact order**,
in the SQL Editor (each one only adds what the previous ones didn't have
yet, so it's safe even if you're not sure which you've already run):

1. `sync_schema.sql` - creates `dog_profiles`, `journal_entries`, `progress`
   tables and the `media` storage bucket.
2. `sync_schema_v2.sql` - lets a level resume where you left off.
3. `sync_schema_v3.sql` - adds the weekly practice-streak columns.
4. `sync_schema_v4.sql` - adds the dog's age group / experience level.
5. `sync_schema_v5.sql` - switches `dog_profiles` to support multiple dogs
   per account (needed for the dog switcher in the profile screen).
6. `sync_schema_v6.sql` - adds the post-level feedback table.

If saving a dog profile (or a journal entry, or progress) fails with a
generic error, the most common cause is one of these files not having been
run yet against your project - open the browser devtools console for the
real Postgres error (e.g. "column ... does not exist") to confirm.

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
