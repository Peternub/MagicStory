create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  subscription_status text not null default 'free',
  stories_balance integer not null default 3 check (stories_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  age integer not null check (age between 3 and 10),
  interests text,
  fears text,
  additional_context text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  theme text not null,
  title text,
  text_content text,
  status text not null default 'pending',
  provider_llm text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stories_status_check check (
    status in (
      'pending',
      'text_generating',
      'completed',
      'failed'
    )
  )
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  story_id uuid references public.stories (id) on delete set null,
  event_type text not null,
  amount integer not null,
  created_at timestamptz not null default now()
);

create index if not exists children_user_id_idx on public.children (user_id);
create index if not exists stories_user_id_idx on public.stories (user_id);
create index if not exists stories_child_id_idx on public.stories (child_id);
create index if not exists usage_events_user_id_idx on public.usage_events (user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists children_set_updated_at on public.children;
create trigger children_set_updated_at
  before update on public.children
  for each row execute procedure public.set_updated_at();

drop trigger if exists stories_set_updated_at on public.stories;
create trigger stories_set_updated_at
  before update on public.stories
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.stories enable row level security;
alter table public.usage_events enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id);

create policy "children_select_own"
on public.children
for select
using (auth.uid() = user_id);

create policy "children_insert_own"
on public.children
for insert
with check (auth.uid() = user_id);

create policy "children_update_own"
on public.children
for update
using (auth.uid() = user_id);

create policy "children_delete_own"
on public.children
for delete
using (auth.uid() = user_id);

create policy "stories_select_own"
on public.stories
for select
using (auth.uid() = user_id);

create policy "stories_insert_own"
on public.stories
for insert
with check (auth.uid() = user_id);

create policy "stories_update_own"
on public.stories
for update
using (auth.uid() = user_id);

create policy "stories_delete_own"
on public.stories
for delete
using (auth.uid() = user_id);

create policy "usage_events_select_own"
on public.usage_events
for select
using (auth.uid() = user_id);

create policy "usage_events_insert_own"
on public.usage_events
for insert
with check (auth.uid() = user_id);
