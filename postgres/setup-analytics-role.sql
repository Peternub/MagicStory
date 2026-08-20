\set ON_ERROR_STOP on

\if :{?analytics_password}
\else
  \echo 'Передайте пароль через --set=analytics_password=...'
  \quit 1
\endif

select format(
  'create role skazkids_analytics login password %L',
  :'analytics_password'
)
where not exists (
  select 1 from pg_catalog.pg_roles where rolname = 'skazkids_analytics'
) \gexec

alter role skazkids_analytics
  nosuperuser
  nocreatedb
  nocreaterole
  noinherit
  noreplication
  connection limit 3;

grant connect on database skazkids to skazkids_analytics;
grant usage on schema public to skazkids_analytics;

grant select on table
  public."user",
  public.children,
  public.story_series,
  public.stories,
  public.usage_events,
  public.payments,
  public.subscriptions,
  public.subscription_plans,
  public.starter_offer_orders,
  public.analytics_generation_events,
  public.analytics_daily_snapshots,
  public.analytics_alert_state
to skazkids_analytics;

grant insert, update on table
  public.analytics_daily_snapshots,
  public.analytics_alert_state
to skazkids_analytics;
