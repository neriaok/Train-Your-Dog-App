-- Run this once in your Supabase project's SQL editor (Database -> SQL Editor)
-- after creating the project. Sets up the profiles table the app reads
-- subscription status from (src/auth/AuthContext.tsx).

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Deliberately no UPDATE policy for regular users: Postgres row-level
-- security policies apply per-row, not per-column, so an "update your own
-- row" policy would let a signed-in user set is_premium = true on
-- themselves via the client SDK - handing out free premium. The app has
-- no other profile fields users need to self-edit today, so the simplest
-- safe answer is no client-side UPDATE at all. is_premium is only ever
-- written server-side, with the service role key (bypasses RLS) - either
-- by hand via the Table Editor for testing, or by backend/payments-worker
-- once real payments are wired up.

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- To try the premium experience by hand before real payments exist:
-- Table Editor -> profiles -> edit the is_premium cell for your test user.
