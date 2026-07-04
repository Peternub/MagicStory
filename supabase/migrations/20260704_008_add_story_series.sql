create table if not exists public.story_series (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  title text not null,
  premise text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stories
  add column if not exists series_id uuid references public.story_series (id) on delete cascade,
  add column if not exists episode_number integer check (episode_number is null or episode_number > 0);

create index if not exists story_series_user_id_idx on public.story_series (user_id);
create index if not exists story_series_child_id_idx on public.story_series (child_id);
create index if not exists stories_series_id_idx on public.stories (series_id);
create unique index if not exists stories_series_episode_idx
  on public.stories (series_id, episode_number)
  where series_id is not null;

drop trigger if exists story_series_set_updated_at on public.story_series;
create trigger story_series_set_updated_at
  before update on public.story_series
  for each row execute procedure public.set_updated_at();

alter table public.story_series enable row level security;

create policy "story_series_select_own"
on public.story_series
for select
using (auth.uid() = user_id);

create policy "story_series_insert_own"
on public.story_series
for insert
with check (auth.uid() = user_id);

create policy "story_series_update_own"
on public.story_series
for update
using (auth.uid() = user_id);

create policy "story_series_delete_own"
on public.story_series
for delete
using (auth.uid() = user_id);
