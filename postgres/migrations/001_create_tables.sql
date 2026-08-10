begin;

create extension if not exists pgcrypto;

set local role magicstory_owner;

create table public.profiles (
  id uuid primary key,
  email text,
  first_name text,
  last_name text,
  subscription_status text not null default 'free',
  stories_balance integer not null default 3 check (stories_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  age integer not null,
  gender text not null default 'boy' check (gender in ('boy', 'girl')),
  interests text,
  fears text,
  additional_context text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  price_rub integer not null default 0,
  stories_limit integer not null default 0,
  is_active boolean not null default true,
  billing_period text not null default 'month'
    check (billing_period in ('month', 'once')),
  is_unlimited boolean not null default false,
  model_code text not null default 'gpt-5.6-terra',
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'past_due', 'canceled', 'expired')),
  started_at timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  external_customer_id text,
  external_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  provider text not null default 'yookassa',
  status text not null default 'pending'
    check (status in ('pending', 'waiting_for_capture', 'succeeded', 'canceled', 'failed')),
  amount_rub integer not null,
  currency text not null default 'RUB',
  external_payment_id text,
  idempotency_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create table public.story_series (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  title text not null,
  premise text not null,
  planned_episodes integer not null default 8
    check (planned_episodes = 3 or planned_episodes between 8 and 16),
  status text not null default 'active'
    check (status in ('draft', 'pending', 'generating', 'active', 'completed', 'failed')),
  model_code text not null default 'gpt-5.6-terra',
  series_memory jsonb not null
    default '{"characters":[],"facts":[],"open_threads":[],"episode_summaries":[]}'::jsonb,
  private_aliases jsonb not null default '{}'::jsonb,
  creation_key uuid,
  last_error text,
  generation_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  child_id uuid references public.children (id) on delete cascade,
  series_id uuid references public.story_series (id) on delete cascade,
  episode_number integer check (episode_number is null or episode_number > 0),
  theme text not null,
  title text,
  text_content text,
  summary text,
  status text not null default 'pending'
    check (status in ('pending', 'generating', 'completed', 'failed')),
  provider_llm text,
  error_message text,
  generation_input jsonb not null default '{}'::jsonb,
  generation_key uuid,
  generation_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  story_id uuid references public.stories (id) on delete set null,
  event_type text not null,
  amount integer not null,
  created_at timestamptz not null default now()
);

create table public.starter_offer_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  price_rub integer not null default 39 check (price_rub = 39),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'used', 'canceled')),
  series_id uuid unique references public.story_series (id) on delete set null,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  consumed_at timestamptz
);

create index children_user_id_idx on public.children (user_id);
create index subscriptions_user_id_idx on public.subscriptions (user_id);
create index payments_user_id_idx on public.payments (user_id);
create index payments_subscription_id_idx on public.payments (subscription_id);
create index story_series_user_id_idx on public.story_series (user_id);
create index story_series_child_id_idx on public.story_series (child_id);
create index stories_user_id_idx on public.stories (user_id);
create index stories_child_id_idx on public.stories (child_id);
create index stories_series_id_idx on public.stories (series_id);
create index usage_events_user_id_idx on public.usage_events (user_id);

create unique index story_series_creation_key_idx
  on public.story_series (user_id, creation_key)
  where creation_key is not null;

create unique index stories_series_episode_idx
  on public.stories (series_id, episode_number)
  where series_id is not null;

create unique index stories_generation_key_idx
  on public.stories (user_id, generation_key)
  where generation_key is not null;

create unique index stories_one_active_generation_per_user_idx
  on public.stories (user_id)
  where status in ('pending', 'generating');

create unique index usage_events_story_episode_created_idx
  on public.usage_events (story_id, event_type)
  where story_id is not null and event_type = 'series_episode_created';

create unique index payments_external_payment_id_idx
  on public.payments (provider, external_payment_id)
  where external_payment_id is not null;

create unique index payments_idempotency_key_idx
  on public.payments (idempotency_key)
  where idempotency_key is not null;

grant usage on schema public to magicstory_app;
grant select, insert, update, delete on all tables in schema public to magicstory_app;
grant usage, select, update on all sequences in schema public to magicstory_app;

commit;
