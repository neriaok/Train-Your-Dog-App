-- Run this once in your Supabase project's SQL editor, AFTER schema.sql.
-- Adds the tables that let the dog profile, training journal, and level
-- progress/streak sync across devices instead of living only in the
-- browser's local storage - plus a Storage bucket for journal/profile
-- photos and videos, so media is no longer squeezed into local storage
-- as base64 (which is what caused the "photo too large to save" errors).

-- One dog profile per user.
create table if not exists public.dog_profiles (
  user_id uuid references auth.users on delete cascade primary key,
  name text not null,
  breed text not null default '',
  photo_url text,
  start_date date not null default current_date,
  updated_at timestamptz not null default now()
);

alter table public.dog_profiles enable row level security;

create policy "Users can view own dog profile"
  on public.dog_profiles for select using (auth.uid() = user_id);
create policy "Users can insert own dog profile"
  on public.dog_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own dog profile"
  on public.dog_profiles for update using (auth.uid() = user_id);

-- Many journal entries per user.
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  entry_date date not null default current_date,
  media_url text,
  media_type text check (media_type in ('photo', 'video')),
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.journal_entries enable row level security;

create policy "Users can view own journal entries"
  on public.journal_entries for select using (auth.uid() = user_id);
create policy "Users can insert own journal entries"
  on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "Users can delete own journal entries"
  on public.journal_entries for delete using (auth.uid() = user_id);

-- One progress row per user: which levels are done, and the practice streak.
create table if not exists public.progress (
  user_id uuid references auth.users on delete cascade primary key,
  completed_levels jsonb not null default '[]'::jsonb,
  streak int not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "Users can view own progress"
  on public.progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress"
  on public.progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress"
  on public.progress for update using (auth.uid() = user_id);

-- Shared Storage bucket for profile photos and journal media. Public so
-- the app can just use the plain URL to display images/video - write
-- access is still locked to each user's own folder (path starts with
-- their user id) by the policies below.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "Users can upload to own folder" on storage.objects;
create policy "Users can upload to own folder"
  on storage.objects for insert
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update own files" on storage.objects;
create policy "Users can update own files"
  on storage.objects for update
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete own files" on storage.objects;
create policy "Users can delete own files"
  on storage.objects for delete
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Media is publicly readable" on storage.objects;
create policy "Media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'media');
