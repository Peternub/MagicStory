import { comparisonMetric, finiteNumber, rateMetric, unavailableComparison, unavailableRate } from "../metrics";
import type { AnalyticsPeriods, NormalizedMetrics } from "../types";

export type QueryResult<Row> = { rows: Row[] };
export type QueryExecutor = <Row>(sql: string, values: unknown[]) => Promise<QueryResult<Row>>;

type UsersRow = {
  new_current: unknown;
  new_previous: unknown;
  new_baseline: unknown;
  active_current: unknown;
  active_previous: unknown;
  active_baseline: unknown;
  returned_current: unknown;
};

type ContentRow = {
  children_current: unknown;
  children_previous: unknown;
  children_baseline: unknown;
  series_current: unknown;
  series_previous: unknown;
  series_baseline: unknown;
  episodes_current: unknown;
  episodes_previous: unknown;
  episodes_baseline: unknown;
  success_current: unknown;
  success_previous: unknown;
  success_baseline: unknown;
  failed_current: unknown;
  failed_previous: unknown;
  failed_baseline: unknown;
  first_series_users: unknown;
  continuing_users: unknown;
};

type RetentionRow = {
  episode_two_users: unknown;
  episode_one_users: unknown;
};

type AiRow = {
  requests_current: unknown;
  requests_previous: unknown;
  requests_baseline: unknown;
  success_current: unknown;
  success_previous: unknown;
  success_baseline: unknown;
  failed_current: unknown;
  failed_previous: unknown;
  failed_baseline: unknown;
  avg_latency_ms: unknown;
  p95_latency_ms: unknown;
  input_tokens: unknown;
  output_tokens: unknown;
  estimated_cost_usd: unknown;
};

type AiModelRow = { provider: string; model: string; requests: unknown };
type AiErrorRow = { error_category: string; count: unknown };

const USERS_SQL = `
/* analytics:users */
with bounds as (
  select
    $1::timestamptz current_from,
    $2::timestamptz current_to,
    $3::timestamptz previous_from,
    $4::timestamptz baseline_from,
    $5::integer baseline_days
), active_by_day as (
  select date_bin('24 hours', event.created_at, bounds.baseline_from) bucket,
    count(distinct event.user_id)::numeric value
  from public.usage_events event cross join bounds
  where event.event_type = 'series_episode_created'
    and event.created_at >= bounds.baseline_from
    and event.created_at < bounds.previous_from
  group by bucket
), previous_active as (
  select distinct event.user_id
  from public.usage_events event cross join bounds
  where event.event_type = 'series_episode_created'
    and event.created_at >= bounds.previous_from
    and event.created_at < bounds.current_from
), current_active as (
  select distinct event.user_id
  from public.usage_events event cross join bounds
  where event.event_type = 'series_episode_created'
    and event.created_at >= bounds.current_from
    and event.created_at < bounds.current_to
)
select
  (select count(*) from public."user" u, bounds where u."createdAt" >= current_from and u."createdAt" < current_to) new_current,
  (select count(*) from public."user" u, bounds where u."createdAt" >= previous_from and u."createdAt" < current_from) new_previous,
  (select count(*)::numeric / baseline_days from public."user" u, bounds where u."createdAt" >= baseline_from and u."createdAt" < previous_from) new_baseline,
  (select count(*) from current_active) active_current,
  (select count(*) from previous_active) active_previous,
  (select coalesce(sum(value), 0) / (select baseline_days from bounds) from active_by_day) active_baseline,
  (select count(*) from previous_active join current_active using (user_id)) returned_current
`;

const CONTENT_SQL = `
/* analytics:content */
with bounds as (
  select $1::timestamptz current_from, $2::timestamptz current_to,
    $3::timestamptz previous_from, $4::timestamptz baseline_from,
    $5::integer baseline_days
)
select
  (select count(*) from public.children child where child.created_at >= current_from and child.created_at < current_to) children_current,
  (select count(*) from public.children child where child.created_at >= previous_from and child.created_at < current_from) children_previous,
  (select count(*)::numeric / baseline_days from public.children child where child.created_at >= baseline_from and child.created_at < previous_from) children_baseline,
  (select count(*) from public.story_series s where s.created_at >= current_from and s.created_at < current_to) series_current,
  (select count(*) from public.story_series s where s.created_at >= previous_from and s.created_at < current_from) series_previous,
  (select count(*)::numeric / baseline_days from public.story_series s where s.created_at >= baseline_from and s.created_at < previous_from) series_baseline,
  (select count(*) from public.stories s where s.created_at >= current_from and s.created_at < current_to) episodes_current,
  (select count(*) from public.stories s where s.created_at >= previous_from and s.created_at < current_from) episodes_previous,
  (select count(*)::numeric / baseline_days from public.stories s where s.created_at >= baseline_from and s.created_at < previous_from) episodes_baseline,
  (select count(*) from public.usage_events e where e.event_type = 'series_episode_created' and e.created_at >= current_from and e.created_at < current_to) success_current,
  (select count(*) from public.usage_events e where e.event_type = 'series_episode_created' and e.created_at >= previous_from and e.created_at < current_from) success_previous,
  (select count(*)::numeric / baseline_days from public.usage_events e where e.event_type = 'series_episode_created' and e.created_at >= baseline_from and e.created_at < previous_from) success_baseline,
  (select count(*) from public.analytics_generation_events e where e.status = 'failed' and e.occurred_at >= current_from and e.occurred_at < current_to) failed_current,
  (select count(*) from public.analytics_generation_events e where e.status = 'failed' and e.occurred_at >= previous_from and e.occurred_at < current_from) failed_previous,
  (select count(*)::numeric / baseline_days from public.analytics_generation_events e where e.status = 'failed' and e.occurred_at >= baseline_from and e.occurred_at < previous_from) failed_baseline,
  (select count(*) from (
    select s.user_id from public.story_series s group by s.user_id having min(s.created_at) >= current_from and min(s.created_at) < current_to
  ) first_series) first_series_users,
  (select count(distinct s.user_id) from public.stories s where s.episode_number >= 2 and s.created_at >= current_from and s.created_at < current_to) continuing_users
from bounds
`;

const RETENTION_SQL = `
/* analytics:retention */
with successful as (
  select distinct story.user_id, story.episode_number
  from public.stories story
  join public.usage_events event on event.story_id = story.id
  where event.event_type = 'series_episode_created'
)
select
  count(distinct user_id) filter (where episode_number = 1) episode_one_users,
  count(distinct user_id) filter (where episode_number = 2) episode_two_users
from successful
`;

const AI_SQL = `
/* analytics:ai */
with bounds as (
  select $1::timestamptz current_from, $2::timestamptz current_to,
    $3::timestamptz previous_from, $4::timestamptz baseline_from,
    $5::integer baseline_days
)
select
  count(*) filter (where occurred_at >= current_from and occurred_at < current_to) requests_current,
  count(*) filter (where occurred_at >= previous_from and occurred_at < current_from) requests_previous,
  count(*) filter (where occurred_at >= baseline_from and occurred_at < previous_from)::numeric / baseline_days requests_baseline,
  count(*) filter (where status = 'succeeded' and occurred_at >= current_from and occurred_at < current_to) success_current,
  count(*) filter (where status = 'succeeded' and occurred_at >= previous_from and occurred_at < current_from) success_previous,
  count(*) filter (where status = 'succeeded' and occurred_at >= baseline_from and occurred_at < previous_from)::numeric / baseline_days success_baseline,
  count(*) filter (where status = 'failed' and occurred_at >= current_from and occurred_at < current_to) failed_current,
  count(*) filter (where status = 'failed' and occurred_at >= previous_from and occurred_at < current_from) failed_previous,
  count(*) filter (where status = 'failed' and occurred_at >= baseline_from and occurred_at < previous_from)::numeric / baseline_days failed_baseline,
  avg(latency_ms) filter (where occurred_at >= current_from and occurred_at < current_to) avg_latency_ms,
  percentile_cont(0.95) within group (order by latency_ms) filter (where occurred_at >= current_from and occurred_at < current_to) p95_latency_ms,
  coalesce(sum(input_tokens) filter (where occurred_at >= current_from and occurred_at < current_to), 0) input_tokens,
  coalesce(sum(output_tokens) filter (where occurred_at >= current_from and occurred_at < current_to), 0) output_tokens,
  coalesce(sum(estimated_cost_usd) filter (where occurred_at >= current_from and occurred_at < current_to), 0) estimated_cost_usd
from public.analytics_generation_events cross join bounds
`;

const AI_MODELS_SQL = `
/* analytics:ai-models */
select provider, model, count(*) requests
from public.analytics_generation_events
where occurred_at >= $1::timestamptz and occurred_at < $2::timestamptz
group by provider, model
order by requests desc, provider, model
`;

const AI_ERRORS_SQL = `
/* analytics:ai-errors */
select coalesce(error_category, 'unknown') error_category, count(*)
from public.analytics_generation_events
where status = 'failed'
  and occurred_at >= $1::timestamptz and occurred_at < $2::timestamptz
group by error_category
order by count(*) desc, error_category
limit 5
`;

function queryValues(periods: AnalyticsPeriods) {
  return [
    periods.current.from,
    periods.current.to,
    periods.previous.from,
    periods.baseline.from,
    periods.baseline.days
  ];
}

export async function collectProductMetrics(
  query: QueryExecutor,
  periods: AnalyticsPeriods,
  minimumRetentionSample = 10
): Promise<NormalizedMetrics> {
  const values = queryValues(periods);
  const [usersResult, contentResult, retentionResult, aiResult, modelsResult, errorsResult] = await Promise.allSettled([
    query<UsersRow>(USERS_SQL, values),
    query<ContentRow>(CONTENT_SQL, values),
    query<RetentionRow>(RETENTION_SQL, []),
    query<AiRow>(AI_SQL, values),
    query<AiModelRow>(AI_MODELS_SQL, [periods.current.from, periods.current.to]),
    query<AiErrorRow>(AI_ERRORS_SQL, [periods.current.from, periods.current.to])
  ]);
  const warnings: string[] = [];

  const users = usersResult.status === "fulfilled" ? usersResult.value.rows[0] : null;
  if (!users) warnings.push("users_metrics_unavailable");
  const content = contentResult.status === "fulfilled" ? contentResult.value.rows[0] : null;
  if (!content) warnings.push("content_metrics_unavailable");
  const retention = retentionResult.status === "fulfilled" ? retentionResult.value.rows[0] : null;
  if (!retention) warnings.push("retention_metrics_unavailable");
  const ai = aiResult.status === "fulfilled" ? aiResult.value.rows[0] : null;
  if (!ai) warnings.push("ai_metrics_unavailable");
  const models = modelsResult.status === "fulfilled" ? modelsResult.value.rows : [];
  if (modelsResult.status === "rejected") warnings.push("ai_model_metrics_unavailable");
  const errors = errorsResult.status === "fulfilled" ? errorsResult.value.rows : [];
  if (errorsResult.status === "rejected") warnings.push("ai_error_categories_unavailable");

  const activeCurrent = users ? finiteNumber(users.active_current) : 0;
  const successfulCurrent = content ? finiteNumber(content.success_current) : 0;
  const aiRequests = ai ? finiteNumber(ai.requests_current) : 0;
  const aiFailed = ai ? finiteNumber(ai.failed_current) : 0;

  return {
    period: periods,
    users: {
      new: users
        ? comparisonMetric(users.new_current, users.new_previous, users.new_baseline)
        : unavailableComparison(),
      active: users
        ? comparisonMetric(users.active_current, users.active_previous, users.active_baseline)
        : unavailableComparison(),
      nextDayReturn: users
        ? rateMetric(users.returned_current, users.active_previous, minimumRetentionSample)
        : unavailableRate()
    },
    content: {
      childProfilesCreated: content
        ? comparisonMetric(content.children_current, content.children_previous, content.children_baseline)
        : unavailableComparison(),
      seriesCreated: content
        ? comparisonMetric(content.series_current, content.series_previous, content.series_baseline)
        : unavailableComparison(),
      episodesCreated: content
        ? comparisonMetric(content.episodes_current, content.episodes_previous, content.episodes_baseline)
        : unavailableComparison(),
      successfulGenerations: content
        ? comparisonMetric(content.success_current, content.success_previous, content.success_baseline)
        : unavailableComparison(),
      failedGenerations: content
        ? comparisonMetric(content.failed_current, content.failed_previous, content.failed_baseline)
        : unavailableComparison(),
      firstSeriesUsers: content ? finiteNumber(content.first_series_users) : null,
      continuingSeriesUsers: content ? finiteNumber(content.continuing_users) : null,
      episodesPerActiveUser: content && users && activeCurrent > 0
        ? Math.round((successfulCurrent / activeCurrent) * 100) / 100
        : null,
      episodeContinuationRate: retention
        ? rateMetric(retention.episode_two_users, retention.episode_one_users, minimumRetentionSample)
        : unavailableRate(),
      availability: content ? "available" : "unavailable"
    },
    ai: {
      requests: ai
        ? comparisonMetric(ai.requests_current, ai.requests_previous, ai.requests_baseline)
        : unavailableComparison(),
      successful: ai
        ? comparisonMetric(ai.success_current, ai.success_previous, ai.success_baseline)
        : unavailableComparison(),
      failed: ai
        ? comparisonMetric(ai.failed_current, ai.failed_previous, ai.failed_baseline)
        : unavailableComparison(),
      errorRate: ai && aiRequests > 0 ? Math.round((aiFailed / aiRequests) * 10_000) / 100 : null,
      avgLatencyMs: ai && aiRequests > 0 ? Math.round(finiteNumber(ai.avg_latency_ms)) : null,
      p95LatencyMs: ai && aiRequests > 0 ? Math.round(finiteNumber(ai.p95_latency_ms)) : null,
      inputTokens: ai ? finiteNumber(ai.input_tokens) : null,
      outputTokens: ai ? finiteNumber(ai.output_tokens) : null,
      estimatedCostUsd: ai ? Math.round(finiteNumber(ai.estimated_cost_usd) * 1_000_000) / 1_000_000 : null,
      models: models.map((row) => ({
        provider: row.provider,
        model: row.model,
        requests: finiteNumber(row.requests)
      })),
      errorCategories: errors
        .filter((row) => typeof row.error_category === "string" && finiteNumber(row.count) > 0)
        .map((row) => ({
          category: row.error_category,
          count: finiteNumber(row.count)
        })),
      availability: ai ? "available" : "unavailable"
    },
    collectionWarnings: warnings
  };
}
