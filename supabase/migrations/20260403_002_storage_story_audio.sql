insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'story-audio',
  'story-audio',
  false,
  52428800,
  array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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
);

create policy "story_audio_delete_own"
on storage.objects
for delete
using (
  bucket_id = 'story-audio'
  and auth.uid()::text = (storage.foldername(name))[1]
);
