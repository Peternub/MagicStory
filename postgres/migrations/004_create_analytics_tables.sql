begin;

set local role skazkids_owner;

create table public.analytics_generation_events (
  id uuid primary key default gen_random_uuid(),
  request_id text not null check (request_id ~ '^[a-f0-9]{64}$'),
  story_id uuid references public.stories (id) on delete set null,
  status text not null check (status in ('succeeded', 'failed')),
  provider text not null,
  model text not null,
  latency_ms integer not null check (latency_ms >= 0),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  estimated_cost_usd numeric(12, 6) not null default 0
    check (estimated_cost_usd >= 0),
  error_category text check (
    error_category is null or error_category in (
      'timeout',
      'rate_limit',
      'unavailable',
      'invalid_response',
      'configuration',
      'database',
      'unknown'
    )
  ),
  occurred_at timestamptz not null default now(),
  check (
    (status = 'succeeded' and error_category is null)
    or (status = 'failed' and error_category is not null)
  )
);

create table public.analytics_daily_snapshots (
  id uuid primary key default gen_random_uuid(),
  report_date date not null unique,
  timezone text not null,
  period_from timestamptz not null,
  period_to timestamptz not null,
  metrics jsonb not null,
  health jsonb not null,
  rule_results jsonb not null,
  ai_analysis jsonb,
  estimated_ai_cost_usd numeric(12, 6) not null default 0
    check (estimated_ai_cost_usd >= 0),
  report_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_from < period_to)
);

create table public.analytics_alert_state (
  code text primary key,
  severity text not null check (severity in ('warning', 'critical')),
  status text not null check (status in ('open', 'resolved')),
  fingerprint text not null,
  first_detected_at timestamptz not null,
  last_detected_at timestamptz not null,
  last_alerted_at timestamptz,
  resolved_at timestamptz,
  details jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  check (first_detected_at <= last_detected_at),
  check (
    (status = 'open' and resolved_at is null)
    or (status = 'resolved' and resolved_at is not null)
  )
);

create index analytics_generation_events_occurred_at_idx
  on public.analytics_generation_events (occurred_at);

create index analytics_generation_events_status_occurred_at_idx
  on public.analytics_generation_events (status, occurred_at);

create index analytics_generation_events_model_occurred_at_idx
  on public.analytics_generation_events (model, occurred_at);

create index analytics_generation_events_story_id_idx
  on public.analytics_generation_events (story_id);

create index analytics_alert_state_status_idx
  on public.analytics_alert_state (status);

create index user_created_at_idx on public."user" ("createdAt");
create index children_created_at_idx on public.children (created_at);
create index story_series_created_at_idx on public.story_series (created_at);
create index story_series_user_created_at_idx
  on public.story_series (user_id, created_at);
create index stories_created_at_idx on public.stories (created_at);
create index stories_status_updated_at_idx
  on public.stories (status, updated_at);
create index stories_series_episode_status_idx
  on public.stories (series_id, episode_number, status);
create index usage_events_type_created_at_idx
  on public.usage_events (event_type, created_at);
create index usage_events_user_type_created_at_idx
  on public.usage_events (user_id, event_type, created_at);

create trigger analytics_daily_snapshots_set_updated_at
  before update on public.analytics_daily_snapshots
  for each row execute function public.set_updated_at();

create trigger analytics_alert_state_set_updated_at
  before update on public.analytics_alert_state
  for each row execute function public.set_updated_at();

create or replace function public.record_analytics_generation_event(
  target_request_id text,
  target_story_id uuid,
  target_status text,
  target_provider text,
  target_model text,
  target_latency_ms integer,
  target_input_tokens integer,
  target_output_tokens integer,
  target_estimated_cost_usd numeric,
  target_error_category text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  created_event_id uuid;
begin
  if not exists (
    select 1
    from public.stories
    where id = target_story_id
  ) then
    raise exception 'ANALYTICS_STORY_NOT_FOUND';
  end if;

  insert into public.analytics_generation_events (
    request_id,
    story_id,
    status,
    provider,
    model,
    latency_ms,
    input_tokens,
    output_tokens,
    estimated_cost_usd,
    error_category
  )
  values (
    target_request_id,
    target_story_id,
    target_status,
    left(target_provider, 80),
    left(target_model, 120),
    target_latency_ms,
    target_input_tokens,
    target_output_tokens,
    target_estimated_cost_usd,
    target_error_category
  )
  returning id into created_event_id;

  return created_event_id;
end;
$$;

revoke all on table public.analytics_generation_events from public;
revoke all on table public.analytics_daily_snapshots from public;
revoke all on table public.analytics_alert_state from public;
revoke all on function public.record_analytics_generation_event(
  text, uuid, text, text, text, integer, integer, integer, numeric, text
) from public;

grant execute on function public.record_analytics_generation_event(
  text, uuid, text, text, text, integer, integer, integer, numeric, text
) to skazkids_app;

commit;
