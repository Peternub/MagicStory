alter table public.stories
  drop column if exists audio_url,
  drop column if exists provider_tts;

update public.stories
set status = 'completed'
where status in ('text_ready', 'audio_generating');

alter table public.stories
  drop constraint if exists stories_status_check;

alter table public.stories
  add constraint stories_status_check check (
    status in (
      'pending',
      'text_generating',
      'completed',
      'failed'
    )
  );

drop policy if exists "story_audio_select_own" on storage.objects;
drop policy if exists "story_audio_insert_own" on storage.objects;
drop policy if exists "story_audio_update_own" on storage.objects;
drop policy if exists "story_audio_delete_own" on storage.objects;

delete from storage.objects where bucket_id = 'story-audio';
delete from storage.buckets where id = 'story-audio';
