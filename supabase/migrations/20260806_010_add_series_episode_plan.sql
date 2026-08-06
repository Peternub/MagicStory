alter table public.story_series
  add column if not exists planned_episodes integer not null default 8;

update public.story_series
set planned_episodes = greatest(8, least(16, planned_episodes));

alter table public.story_series
  drop constraint if exists story_series_planned_episodes_check;

alter table public.story_series
  add constraint story_series_planned_episodes_check
  check (planned_episodes between 8 and 16);
