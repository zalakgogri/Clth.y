-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- One row each time a visitor asks for a confirmation. Visitors can only add rows; only you can read them (Table Editor).
create table if not exists public.report_requests (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  email text not null,
  season text,
  looks_count integer
);
alter table public.report_requests enable row level security;
drop policy if exists "anyone can submit" on public.report_requests;
create policy "anyone can submit" on public.report_requests for insert to anon with check (true);
grant insert on public.report_requests to anon;
