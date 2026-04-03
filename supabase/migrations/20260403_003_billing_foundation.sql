create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  price_rub integer not null default 0,
  stories_limit integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id),
  status text not null default 'pending',
  started_at timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  external_customer_id text,
  external_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_status_check check (
    status in ('pending', 'active', 'past_due', 'canceled', 'expired')
  )
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  provider text not null default 'yookassa',
  status text not null default 'pending',
  amount_rub integer not null,
  currency text not null default 'RUB',
  external_payment_id text,
  idempotency_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint payments_status_check check (
    status in ('pending', 'waiting_for_capture', 'succeeded', 'canceled', 'failed')
  )
);

create unique index if not exists subscription_plans_code_idx
  on public.subscription_plans (code);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

create index if not exists payments_user_id_idx
  on public.payments (user_id);

create index if not exists payments_subscription_id_idx
  on public.payments (subscription_id);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute procedure public.set_updated_at();

alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

create policy "subscription_plans_select_active"
on public.subscription_plans
for select
using (is_active = true);

create policy "subscriptions_select_own"
on public.subscriptions
for select
using (auth.uid() = user_id);

create policy "subscriptions_insert_own"
on public.subscriptions
for insert
with check (auth.uid() = user_id);

create policy "subscriptions_update_own"
on public.subscriptions
for update
using (auth.uid() = user_id);

create policy "payments_select_own"
on public.payments
for select
using (auth.uid() = user_id);

create policy "payments_insert_own"
on public.payments
for insert
with check (auth.uid() = user_id);

insert into public.subscription_plans (code, name, description, price_rub, stories_limit, is_active)
values
  ('free', 'Бесплатный', 'Стартовый тариф для знакомства с сервисом', 0, 3, true),
  ('plus', 'Магия Плюс', 'Подписка для регулярного создания новых сказок', 490, 30, true)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  price_rub = excluded.price_rub,
  stories_limit = excluded.stories_limit,
  is_active = excluded.is_active;
