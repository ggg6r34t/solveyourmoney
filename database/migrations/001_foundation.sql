create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key,
  email text,
  display_name text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.money_intakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  monthly_surplus numeric not null default 0,
  runway_months numeric not null default 0,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.money_intakes enable row level security;
alter table public.financial_snapshots enable row level security;

create policy if not exists "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy if not exists "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

create policy if not exists "money_intakes_all_own"
on public.money_intakes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "financial_snapshots_all_own"
on public.financial_snapshots for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
