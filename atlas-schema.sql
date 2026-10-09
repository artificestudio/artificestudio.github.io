-- Run ONCE in your Supabase SQL editor; then configure atlas-config.js.
create extension if not exists pgcrypto;
create table if not exists public.atlas_places (
 id text primary key default gen_random_uuid()::text,
 name text not null check(length(name) between 1 and 150),
 city text not null check(length(city) between 1 and 100),
 country text not null check(length(country) between 1 and 100),
 year text,
 description text not null check(length(description) <= 1500),
 source text,
 project text,
 longitude double precision not null check(longitude between -180 and 180),
 latitude double precision not null check(latitude between -90 and 90),
 status text not null default 'pending' check(status in ('pending','published','rejected')),
 submitted_at timestamptz not null default now()
);
alter table public.atlas_places enable row level security;
create policy "Read published places" on public.atlas_places for select to anon,authenticated using(status='published');
create policy "Submit unreviewed place" on public.atlas_places for insert to anon,authenticated with check(status='pending' and project is null);
-- Keep reviews via Supabase dashboard initially. Do NOT allow anonymous UPDATE/DELETE.
-- Before opening this form widely, add rate limiting, CAPTCHA and abuse monitoring
-- through a backend/Edge Function. Public insert RLS alone is not spam protection.
