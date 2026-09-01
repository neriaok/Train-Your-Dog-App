-- Run once, after sync_schema_v3.sql. Adds two optional profile fields used
-- to personalize the tip shown on the level-select screen (src/profile/
-- DogProfileContext.tsx, src/screens/DogProfileScreen.tsx).
alter table public.dog_profiles
  add column if not exists age_group text check (age_group in ('puppy', 'adult', 'senior')),
  add column if not exists experience text check (experience in ('beginner', 'experienced'));
