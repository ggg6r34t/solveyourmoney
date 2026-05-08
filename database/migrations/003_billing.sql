-- Add subscription tracking to financial_profiles
-- Valid values for subscription_status: free, active, cancelled, past_due
alter table public.financial_profiles
  add column if not exists subscription_status text not null default 'free',
  add column if not exists subscription_id text;
