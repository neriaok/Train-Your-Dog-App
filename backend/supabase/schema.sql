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

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

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

-- Note: `is_premium` is intentionally NOT updatable by the user's own RLS
-- policy above (only select/update as themselves is granted, and the app
-- never writes to is_premium client-side). Until real payments are wired
-- up (see backend/payments-worker), flip a user to premium manually for
-- testing: Table Editor -> profiles -> edit the is_premium cell. Once
-- payments go live, the payments worker updates it server-side with the
-- Supabase service role key, which bypasses RLS.
