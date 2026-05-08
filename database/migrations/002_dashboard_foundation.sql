create table if not exists public.financial_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  preferred_name text,
  monthly_income numeric not null default 0,
  monthly_auto_save numeric not null default 0,
  level_xp integer not null default 0,
  streak_days integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  provider text,
  balance numeric not null default 0,
  limit_amount numeric,
  apr numeric,
  monthly_payment numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  period_start date not null,
  planned_amount numeric not null default 0,
  actual_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  saved_amount numeric not null default 0,
  target_amount numeric not null default 0,
  monthly_contribution numeric not null default 0,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null,
  xp integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  description text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.financial_profiles enable row level security;
alter table public.debts enable row level security;
alter table public.expenses enable row level security;
alter table public.savings_goals enable row level security;
alter table public.learning_progress enable row level security;
alter table public.activity_logs enable row level security;

create policy if not exists "financial_profiles_all_own"
on public.financial_profiles for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "debts_all_own"
on public.debts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "expenses_all_own"
on public.expenses for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "savings_goals_all_own"
on public.savings_goals for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "learning_progress_all_own"
on public.learning_progress for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "activity_logs_all_own"
on public.activity_logs for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
