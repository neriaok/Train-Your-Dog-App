-- Support multiple dogs per account. dog_profiles previously used user_id
-- as its primary key, which only allowed a single row (one dog) per user.
-- This gives it a proper id primary key instead, so a user can have several
-- dog_profiles rows, and adds the missing delete policy needed to remove a
-- dog profile.
alter table public.dog_profiles drop constraint dog_profiles_pkey;
alter table public.dog_profiles add column id uuid primary key default gen_random_uuid();
create index if not exists dog_profiles_user_id_idx on public.dog_profiles (user_id);

create policy "Users can delete own dog profiles"
  on public.dog_profiles for delete using (auth.uid() = user_id);
