-- Озвучка больше не входит в продукт: удаляем файлы, бакет и служебные поля.
drop policy if exists "story_audio_select_own" on storage.objects;
drop policy if exists "story_audio_insert_own" on storage.objects;
drop policy if exists "story_audio_update_own" on storage.objects;
drop policy if exists "story_audio_delete_own" on storage.objects;

delete from storage.objects
where bucket_id = 'story-audio';

delete from storage.buckets
where id = 'story-audio';

alter table public.stories
  drop constraint if exists stories_tts_status_check,
  drop column if exists audio_path,
  drop column if exists provider_tts,
  drop column if exists tts_task_id,
  drop column if exists tts_response_file_id,
  drop column if exists tts_status,
  drop column if exists tts_error_message;

-- Старые отдельные сказки сохраняются как архив, но новые записи обязаны быть сериями.
create or replace function public.enforce_story_series_membership()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.series_id is null or new.episode_number is null then
    raise exception 'SERIES_REQUIRED';
  end if;

  return new;
end;
$$;

drop trigger if exists stories_require_series on public.stories;
create trigger stories_require_series
  before insert on public.stories
  for each row execute procedure public.enforce_story_series_membership();
