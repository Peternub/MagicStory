-- Соответствие псевдонимов реальным именам хранится только в нашей базе и не отправляется в AI.
alter table public.story_series
  add column if not exists private_aliases jsonb not null default '{}'::jsonb;

create or replace function public.claim_starter_offer(
  target_user_id uuid,
  target_child_id uuid,
  series_title text,
  series_premise text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  offer_order public.starter_offer_orders%rowtype;
  created_series_id uuid;
begin
  select * into offer_order
  from public.starter_offer_orders
  where user_id = target_user_id
  for update;

  if offer_order.user_id is null or offer_order.status <> 'paid' or offer_order.series_id is not null then
    raise exception 'STARTER_OFFER_NOT_AVAILABLE';
  end if;

  if not exists (
    select 1 from public.children
    where id = target_child_id and user_id = target_user_id
  ) then
    raise exception 'CHILD_NOT_FOUND';
  end if;

  insert into public.story_series (
    user_id,
    child_id,
    title,
    premise,
    planned_episodes
  )
  values (
    target_user_id,
    target_child_id,
    series_title,
    series_premise,
    3
  )
  returning id into created_series_id;

  update public.starter_offer_orders
  set status = 'used', series_id = created_series_id, consumed_at = now()
  where user_id = target_user_id;

  return created_series_id;
end;
$$;

revoke all on function public.claim_starter_offer(uuid, uuid, text, text) from public;
revoke all on function public.claim_starter_offer(uuid, uuid, text, text) from anon;
revoke all on function public.claim_starter_offer(uuid, uuid, text, text) from authenticated;
grant execute on function public.claim_starter_offer(uuid, uuid, text, text) to service_role;
