-- Optional free-text feedback, prompted once after a user finishes every
-- level. No select policy for regular users on purpose (only the project
-- owner reads this, from the Supabase dashboard) - same pattern as
-- profiles.is_premium not being client-updatable.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Users can submit feedback"
  on public.feedback for insert with check (auth.uid() = user_id or user_id is null);
