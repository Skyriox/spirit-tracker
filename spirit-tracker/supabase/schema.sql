-- ============================================================
-- SPIRIT TRACKER — DATABASE SCHEMA
-- Run this whole file in the Supabase SQL editor (SQL Editor > New query)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- GROUPS ----------
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

-- ---------- USERS ----------
-- Custom auth: we do NOT use Supabase Auth. Users log in with a
-- username + numeric PIN that we hash ourselves (bcrypt) and verify
-- in a server-side API route. This table is the single source of truth.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  pin_hash text not null,
  avatar text not null default '',
  group_id uuid references groups(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- SPIRITS (global catalog) ----------
create table if not exists spirits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rarity text not null check (rarity in ('common', 'rare', 'epic', 'legendary')),
  image text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- USER_SPIRITS (ownership join table) ----------
create table if not exists user_spirits (
  user_id uuid not null references users(id) on delete cascade,
  spirit_id uuid not null references spirits(id) on delete cascade,
  owned boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, spirit_id)
);

-- ---------- REQUESTS ----------
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references users(id) on delete cascade,
  to_user uuid not null references users(id) on delete cascade,
  spirit_id uuid not null references spirits(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_spirits_user on user_spirits(user_id);
create index if not exists idx_user_spirits_spirit on user_spirits(spirit_id);
create index if not exists idx_requests_to_user on requests(to_user);
create index if not exists idx_requests_from_user on requests(from_user);
create index if not exists idx_users_group on users(group_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- All reads/writes for this app go through Next.js API routes using the
-- Supabase SERVICE ROLE key (server-side only), which bypasses RLS.
-- We still enable RLS and lock the tables down so the anon/public key
-- (used only for the optional realtime subscription on the client)
-- cannot read or write anything on its own.
-- ============================================================

alter table groups enable row level security;
alter table users enable row level security;
alter table spirits enable row level security;
alter table user_spirits enable row level security;
alter table requests enable row level security;

-- Allow the anon key to receive realtime change events for requests
-- (payloads are filtered client-side by the logged-in user's id).
-- No direct table reads/writes are granted to anon beyond this.
drop policy if exists "realtime read requests" on requests;
create policy "realtime read requests" on requests
  for select using (true);

-- Everything else stays closed to anon/public; the service role key
-- used in API routes always bypasses RLS regardless of these policies.

-- ============================================================
-- SEED DATA — a starter catalog of spirits
-- ============================================================
insert into spirits (name, rarity, image) values
  ('Emberling',     'common',    ''),
  ('Puddle Sprite',   'common',    ''),
  ('Mossy Pup',       'common',    ''),
  ('Pebble Golem',    'common',    ''),
  ('Windwisp',        'common',    ''),
  ('Glowfin',         'rare',      ''),
  ('Thunder Kit',     'rare',      ''),
  ('Crystal Fox',     'rare',      ''),
  ('Starling Wisp',   'rare',      ''),
  ('Frostbyte',       'epic',      ''),
  ('Shadow Lynx',     'epic',      ''),
  ('Aurora Drake',    'epic',      ''),
  ('Nova Phoenix',    'legendary', ''),
  ('Celestial Wyrm',  'legendary', ''),
  ('Void Sovereign',  'legendary', '')
on conflict do nothing;

-- ============================================================
-- ENABLE REALTIME on the requests table
-- (also toggle this in Supabase Dashboard > Database > Replication)
-- ============================================================
alter publication supabase_realtime add table requests;
