-- The waitlist table, and the only thing the public page is allowed to do to it.
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- It is safe to re-run.
--
-- The security model: row-level security is on, the anonymous role may INSERT
-- and nothing else, and there is deliberately no SELECT policy — so the
-- publishable key that ships in the page can add a signup but can never read
-- the list back. Because of that the page must send `Prefer: return=minimal`;
-- asking PostgREST to return the inserted row would make Postgres evaluate a
-- SELECT policy that does not exist, and the insert would fail.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null
    check (char_length(btrim(name)) between 2 and 120),
  email text not null
    check (char_length(email) <= 254 and email like '%_@_%.__%'),
  role text
    check (role is null or char_length(role) <= 120),
  field text
    check (field is null or char_length(field) <= 160),

  -- A record of consent: what was shown, whether the optional box was ticked,
  -- and when. Keeping the wording makes the record defensible later.
  consent_text text not null
    check (char_length(consent_text) between 10 and 1000),
  marketing_consent boolean not null default false,

  source text
    check (source is null or char_length(source) <= 500)
);

-- One signup per address, case-insensitively.
create unique index if not exists waitlist_signups_email_key
  on public.waitlist_signups (lower(email));

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

-- Append-only for the public page. No USING clause: INSERT policies take a
-- WITH CHECK expression, and Postgres rejects the other form outright.
drop policy if exists "anyone may join the waitlist" on public.waitlist_signups;
create policy "anyone may join the waitlist"
  on public.waitlist_signups
  for insert
  to anon
  with check (true);

-- Defence in depth: even with a policy mistake later, the public roles hold no
-- privilege to read, change or remove a signup.
revoke all on public.waitlist_signups from anon, authenticated;
grant insert on public.waitlist_signups to anon;

-- Read the list from the dashboard, the CLI, or anything holding the secret
-- key. The secret key bypasses row-level security and must stay off the page.
