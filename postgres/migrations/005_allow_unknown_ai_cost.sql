begin;

set local role skazkids_owner;

alter table public.analytics_generation_events
  alter column estimated_cost_usd drop default,
  alter column estimated_cost_usd drop not null;

alter table public.analytics_daily_snapshots
  alter column estimated_ai_cost_usd drop default,
  alter column estimated_ai_cost_usd drop not null;

commit;
