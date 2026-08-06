const DEFAULT_EPISODE_PLAN = 8;
const SERIES_PLAN_PATTERN = /\s*\[MS_EPISODES:(\d{1,2})\]\s*$/;

export function normalizeSeriesEpisodePlan(value: number) {
  return Math.min(16, Math.max(8, Math.round(value)));
}

export function getSeriesEpisodePlan(premise: string) {
  const match = premise.match(SERIES_PLAN_PATTERN);
  const parsed = match ? Number(match[1]) : DEFAULT_EPISODE_PLAN;

  return normalizeSeriesEpisodePlan(Number.isFinite(parsed) ? parsed : DEFAULT_EPISODE_PLAN);
}

export function stripSeriesEpisodePlan(premise: string) {
  return premise.replace(SERIES_PLAN_PATTERN, "").trim();
}

export function addSeriesEpisodePlan(premise: string, count: number) {
  return `${stripSeriesEpisodePlan(premise)}\n\n[MS_EPISODES:${normalizeSeriesEpisodePlan(count)}]`;
}
