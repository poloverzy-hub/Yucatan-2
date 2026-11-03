-- Run this once in Supabase: SQL Editor > New query.
-- The table has no public grants. Only the Netlify server functions use the
-- service-role key, which bypasses RLS. Never put that key in the website.

create table if not exists public.trip_responses (
  respondent text primary key check (respondent in ('marie-jo', 'tabeth')),
  answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.trip_responses enable row level security;

revoke all on table public.trip_responses from anon, authenticated;

-- Deliberately no RLS policies: browser users cannot read or write this table.
-- The service-role key used by the server functions has the required access.
