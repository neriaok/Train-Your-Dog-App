-- Run once, after sync_schema.sql. Adds columns so the app can resume a
-- partially-finished level exactly where you left off (App.tsx), instead
-- of always restarting a level from its first step.
alter table public.progress
  add column if not exists current_level_id int,
  add column if not exists current_step_idx int not null default 0;
