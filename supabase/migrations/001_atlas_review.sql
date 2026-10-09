-- ARTIFICE ATLAS / 001 — authenticated editorial review
-- Run in a NEW Supabase project's SQL Editor. Never paste any private keys into GitHub.
-- Public proposals enter atlas_submissions and are INVISIBLE until approved.
-- The public has SELECT access only to published entries of atlas_places.
begin;

create extension if not exists pgcrypto;

create table if not exists public.atlas_editors (
  email text primary key check (length(email) between 3 and 254),
  created_at timestamptz not null default now()
);
revoke all on public.atlas_editors from anon, authenticated;
alter table public.atlas_editors enable row level security;

create or replace function public.atlas_is_editor()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(
    select 1
    from public.atlas_editors as e
    join auth.users as u on lower(u.email) = lower(e.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.atlas_is_editor() from public, anon;
grant execute on function public.atlas_is_editor() to authenticated;

create table if not exists public.atlas_places (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(btrim(name)) between 1 and 150),
  city text not null check (length(btrim(city)) between 1 and 100),
  country text not null check (length(btrim(country)) between 1 and 100),
  year text not null default '' check (length(year) <= 50),
  longitude double precision not null check (longitude between -180 and 180),
  latitude double precision not null check (latitude between -85 and 85),
  category text not null default 'other' check (category ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(category) <= 60),
  tags text[] not null default '{}'::text[] check (cardinality(tags) <= 12),
  description text not null default '' check (length(description) <= 10000),
  source text check (source is null or (length(source) <= 1500 and source ~* '^https?://')),
  project text check (project is null or project ~ '^[a-z0-9][a-z0-9_/-]*\.html$'),
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.atlas_places enable row level security;
revoke all on public.atlas_places from anon, authenticated;
grant select on public.atlas_places to anon, authenticated;
grant insert, update on public.atlas_places to authenticated;

drop policy if exists "Atlas published places are public" on public.atlas_places;
create policy "Atlas published places are public" on public.atlas_places
  for select to anon, authenticated using (status = 'published');
drop policy if exists "Atlas editors can view all places" on public.atlas_places;
create policy "Atlas editors can view all places" on public.atlas_places
  for select to authenticated using ((select public.atlas_is_editor()));
drop policy if exists "Atlas editors can create places" on public.atlas_places;
create policy "Atlas editors can create places" on public.atlas_places
  for insert to authenticated with check ((select public.atlas_is_editor()));
drop policy if exists "Atlas editors can update places" on public.atlas_places;
create policy "Atlas editors can update places" on public.atlas_places
  for update to authenticated
  using ((select public.atlas_is_editor()))
  with check ((select public.atlas_is_editor()));

create table if not exists public.atlas_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 150),
  city text not null check (length(btrim(city)) between 1 and 100),
  country text not null check (length(btrim(country)) between 1 and 100),
  year text not null default '' check (length(year) <= 50),
  longitude double precision not null check (longitude between -180 and 180),
  latitude double precision not null check (latitude between -85 and 85),
  category text not null default 'other' check (category ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(category) <= 60),
  tags text[] not null default '{}'::text[] check (cardinality(tags) <= 12),
  description text not null check (length(btrim(description)) between 10 and 1500),
  source text check (source is null or (length(source) <= 1500 and source ~* '^https?://')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  editor_note text check (editor_note is null or length(editor_note) <= 2000),
  published_place_id text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);
alter table public.atlas_submissions enable row level security;
-- Crucial: no direct public insert, read or update. Submissions only through the
-- captcha-protected Edge Function that owns its service role key server-side.
revoke all on public.atlas_submissions from anon, authenticated;
grant select on public.atlas_submissions to authenticated;
drop policy if exists "Atlas editors review submissions" on public.atlas_submissions;
create policy "Atlas editors review submissions" on public.atlas_submissions
  for select to authenticated using ((select public.atlas_is_editor()));

create or replace function public.atlas_review_submission(
  p_id uuid,
  p_action text,
  p_record jsonb default null,
  p_note text default null
)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  item public.atlas_submissions%rowtype;
  place_id text;
  place_status text;
  record_tags text[];
begin
  if not public.atlas_is_editor() then
    raise exception 'Editorial access denied' using errcode = '42501';
  end if;

  select * into item from public.atlas_submissions
    where id = p_id for update;
  if not found then raise exception 'Submission not found'; end if;
  if item.status <> 'pending' then
    raise exception 'This submission has already been reviewed';
  end if;

  if p_action = 'reject' then
    update public.atlas_submissions set status='rejected',
      editor_note=nullif(left(btrim(coalesce(p_note,'')),2000),''),
      reviewed_at=now(), reviewed_by=auth.uid()
    where id=p_id;
    return 'rejected';
  end if;

  if p_action <> 'approve' or p_record is null then
    raise exception 'Invalid moderation action';
  end if;

  place_id := lower(btrim(p_record->>'id'));
  place_status := coalesce(p_record->>'status','published');
  if place_id is null or place_id !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(place_id)>120 then
    raise exception 'Invalid place ID';
  end if;
  if place_status not in ('draft','published') then
    raise exception 'Invalid place status';
  end if;
  if jsonb_typeof(coalesce(p_record->'tags','[]'::jsonb)) <> 'array' then
    raise exception 'Tags must be an array';
  end if;
  select coalesce(array_agg(tags.value), '{}'::text[]) into record_tags
    from jsonb_array_elements_text(coalesce(p_record->'tags','[]'::jsonb)) AS tags(value);
  if cardinality(record_tags) > 12 or
     exists(select 1 from unnest(record_tags) AS t(value) where t.value !~ '^[a-z0-9]+(-[a-z0-9]+)*
  then raise exception 'Invalid tags'; end if;

  -- INSERT + UPDATE are one transaction. On any error, neither happens.
  insert into public.atlas_places (
    id,name,city,country,year,longitude,latitude,category,tags,
    description,source,project,status
  ) values (
    place_id,
    btrim(p_record->>'name'),
    btrim(p_record->>'city'),
    btrim(p_record->>'country'),
    coalesce(p_record->>'year',''),
    (p_record->>'longitude')::double precision,
    (p_record->>'latitude')::double precision,
    coalesce(p_record->>'category','other'),
    record_tags,
    coalesce(p_record->>'description',''),
    nullif(p_record->>'source',''),
    nullif(p_record->>'project',''),
    place_status
  );

  update public.atlas_submissions set
    status='approved', published_place_id=place_id,
    editor_note=nullif(left(btrim(coalesce(p_note,'')),2000),''),
    reviewed_at=now(),reviewed_by=auth.uid()
  where id=p_id;
  return place_id;
end;
$$;
revoke all on function public.atlas_review_submission(uuid,text,jsonb,text) from public, anon;
grant execute on function public.atlas_review_submission(uuid,text,jsonb,text) to authenticated;

commit;

-- AFTER you have set up Supabase Auth email OTP, replace the placeholders
-- below with the two editorial email addresses, then RUN THIS ONE QUERY.
-- insert into public.atlas_editors(email) values
--   ('editor-one@example.com'),
--   ('editor-two@example.com')
-- on conflict (email) do nothing;
 or length(t.value)>50)
  then raise exception 'Invalid tags'; end if;

  -- INSERT + UPDATE are one transaction. On any error, neither happens.
  insert into public.atlas_places (
    id,name,city,country,year,longitude,latitude,category,tags,
    description,source,project,status
  ) values (
    place_id,
    btrim(p_record->>'name'),
    btrim(p_record->>'city'),
    btrim(p_record->>'country'),
    coalesce(p_record->>'year',''),
    (p_record->>'longitude')::double precision,
    (p_record->>'latitude')::double precision,
    coalesce(p_record->>'category','other'),
    record_tags,
    coalesce(p_record->>'description',''),
    nullif(p_record->>'source',''),
    nullif(p_record->>'project',''),
    place_status
  );

  update public.atlas_submissions set
    status='approved', published_place_id=place_id,
    editor_note=nullif(left(btrim(coalesce(p_note,'')),2000),''),
    reviewed_at=now(),reviewed_by=auth.uid()
  where id=p_id;
  return place_id;
end;
$$;
revoke all on function public.atlas_review_submission(uuid,text,jsonb,text) from public, anon;
grant execute on function public.atlas_review_submission(uuid,text,jsonb,text) to authenticated;

commit;

-- AFTER you have set up Supabase Auth email OTP, replace the placeholders
-- below with the two editorial email addresses, then RUN THIS ONE QUERY.
-- insert into public.atlas_editors(email) values
--   ('editor-one@example.com'),
--   ('editor-two@example.com')
-- on conflict (email) do nothing;
