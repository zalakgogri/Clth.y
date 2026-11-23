-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Stores one row each time a visitor asks for their report by email.
create table if not exists public.report_requests (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  email text not null,
  season text,
  looks_count integer,
  ip text
);

-- Locked down: with row level security on and no policies, only the server's service-role key can read or write.
alter table public.report_requests enable row level security;
