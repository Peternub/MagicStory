-- Ограничения профилей детей.
alter table public.children
  drop constraint if exists children_age_check;

alter table public.children
  add constraint children_age_check check (age between 3 and 7) not valid;

create or replace function public.enforce_children_limit()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));

  if (
    select count(*)
    from public.children
    where user_id = new.user_id
  ) >= 5 then
    raise exception 'CHILDREN_LIMIT_REACHED';
  end if;

  return new;
end;
$$;

-- Имя родителя хранится в профиле, а не только в метаданных авторизации.
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text;

update public.profiles profile
set
  first_name = coalesce(
    profile.first_name,
    nullif(trim(auth_user.raw_user_meta_data ->> 'first_name'), '')
  ),
  last_name = coalesce(
    profile.last_name,
    nullif(trim(auth_user.raw_user_meta_data ->> 'last_name'), '')
  )
from auth.users auth_user
where auth_user.id = profile.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'last_name'), '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    first_name = coalesce(public.profiles.first_name, excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name);

  return new;
end;
$$;

drop trigger if exists children_enforce_limit on public.children;
create trigger children_enforce_limit
  before insert on public.children
  for each row execute procedure public.enforce_children_limit();

-- Явные поля сериала вместо служебных маркеров в тексте.
alter table public.story_series
  add column if not exists planned_episodes integer,
  add column if not exists status text not null default 'active',
  add column if not exists model_code text not null default 'gpt-5.6-terra',
  add column if not exists series_memory jsonb not null default '{"characters":[],"facts":[],"open_threads":[],"episode_summaries":[]}'::jsonb,
  add column if not exists creation_key uuid,
  add column if not exists last_error text,
  add column if not exists generation_started_at timestamptz;

update public.story_series
set planned_episodes = coalesce(
  nullif(substring(premise from '\[MS_EPISODES:([0-9]{1,2})\]'), '')::integer,
  8
)
where planned_episodes is null;

alter table public.story_series
  alter column planned_episodes set default 8,
  alter column planned_episodes set not null,
  drop constraint if exists story_series_planned_episodes_check,
  drop constraint if exists story_series_status_check;

alter table public.story_series
  add constraint story_series_planned_episodes_check check (
    planned_episodes = 3 or planned_episodes between 8 and 16
  ),
  add constraint story_series_status_check check (
    status in ('draft', 'pending', 'generating', 'active', 'completed', 'failed')
  );

create unique index if not exists story_series_creation_key_idx
  on public.story_series (user_id, creation_key)
  where creation_key is not null;

-- Данные для памяти и восстановления генерации.
alter table public.stories
  add column if not exists summary text,
  add column if not exists generation_input jsonb not null default '{}'::jsonb,
  add column if not exists generation_key uuid,
  add column if not exists generation_started_at timestamptz;

update public.stories
set status = 'generating'
where status = 'text_generating';

alter table public.stories
  drop constraint if exists stories_status_check;

alter table public.stories
  add constraint stories_status_check check (
    status in ('pending', 'generating', 'completed', 'failed')
  );

create unique index if not exists stories_generation_key_idx
  on public.stories (user_id, generation_key)
  where generation_key is not null;

update public.story_series series
set status = case
  when (
    select count(*)
    from public.stories story
    where story.series_id = series.id and story.status = 'completed'
  ) >= series.planned_episodes then 'completed'
  else 'active'
end;

-- Два безлимитных месячных тарифа.
alter table public.subscription_plans
  add column if not exists billing_period text not null default 'month',
  add column if not exists is_unlimited boolean not null default false,
  add column if not exists model_code text not null default 'gpt-5.6-terra';

alter table public.subscription_plans
  drop constraint if exists subscription_plans_billing_period_check;

alter table public.subscription_plans
  add constraint subscription_plans_billing_period_check check (
    billing_period in ('month', 'once')
  );

insert into public.subscription_plans (
  code,
  name,
  description,
  price_rub,
  stories_limit,
  is_active,
  billing_period,
  is_unlimited,
  model_code
)
values
  (
    'unlimited-plus',
    'Обычные серии',
    'Безлимитные сериалы и серии с обычной моделью генерации',
    555,
    0,
    true,
    'month',
    true,
    'gpt-5.6-terra'
  ),
  (
    'unlimited-premium',
    'Премиум-серии',
    'Безлимитные сериалы и серии с премиальной моделью генерации',
    888,
    0,
    true,
    'month',
    true,
    'gpt-5.6-sol'
  )
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  price_rub = excluded.price_rub,
  stories_limit = excluded.stories_limit,
  is_active = excluded.is_active,
  billing_period = excluded.billing_period,
  is_unlimited = excluded.is_unlimited,
  model_code = excluded.model_code;

update public.subscription_plans
set is_active = false
where code in ('free', 'plus', 'library-monthly');

-- Один внешний платёж нельзя обработать повторно.
create unique index if not exists payments_external_payment_id_idx
  on public.payments (provider, external_payment_id)
  where external_payment_id is not null;

create unique index if not exists payments_idempotency_key_idx
  on public.payments (idempotency_key)
  where idempotency_key is not null;
