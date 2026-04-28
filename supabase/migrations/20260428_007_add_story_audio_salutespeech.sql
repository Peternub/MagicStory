alter table public.stories
  add column if not exists audio_path text,
  add column if not exists provider_tts text,
  add column if not exists tts_task_id text,
  add column if not exists tts_response_file_id text,
  add column if not exists tts_status text not null default 'not_started',
  add column if not exists tts_error_message text;

alter table public.stories
  drop constraint if exists stories_tts_status_check;

alter table public.stories
  add constraint stories_tts_status_check check (
    tts_status in (
      'not_started',
      'audio_generating',
      'completed',
      'failed'
    )
  );

insert into storage.buckets (id, name, public)
values ('story-audio', 'story-audio', false)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "story_audio_select_own" on storage.objects;
drop policy if exists "story_audio_insert_own" on storage.objects;
drop policy if exists "story_audio_update_own" on storage.objects;
drop policy if exists "story_audio_delete_own" on storage.objects;

create policy "story_audio_select_own"
on storage.objects
for select
using (
  bucket_id = 'story-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "story_audio_insert_own"
on storage.objects
for insert
with check (
  bucket_id = 'story-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "story_audio_update_own"
on storage.objects
for update
using (
  bucket_id = 'story-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'story-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "story_audio_delete_own"
on storage.objects
for delete
using (
  bucket_id = 'story-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);
