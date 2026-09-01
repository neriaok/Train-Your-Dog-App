-- Run once, after sync_schema_v2.sql. Adds columns for the weekly practice
-- challenge (src/progress/streak.ts) - which calendar days (Sun-Sat) the
-- user has practiced on this week, reset automatically once a new week
-- starts.
alter table public.progress
  add column if not exists weekly_dates jsonb not null default '[]'::jsonb,
  add column if not exists week_start date;
