import { getSeriesEpisodePlan } from "@/lib/stories/series-plan";

const EMPTY_SERIES_MEMORY = {
  characters: [],
  facts: [],
  open_threads: [],
  episode_summaries: []
};

export type LegacySeries = {
  id: string;
  premise: string;
};

export type LegacyStory = {
  series_id: string | null;
  status: string;
};

export type LegacyAudioStory = {
  audio_path: string | null;
  audio_url: string | null;
};

export function shouldMigrateLegacyStory(story: LegacyAudioStory) {
  return !story.audio_path?.trim() && !story.audio_url?.trim();
}

export function mapLegacyStoryStatus(status: string) {
  if (status === "text_generating") {
    return "generating" as const;
  }

  if (status === "text_ready" || status === "audio_generating") {
    return "completed" as const;
  }

  if (status === "pending" || status === "completed" || status === "failed") {
    return status;
  }

  throw new Error(`Неизвестный статус старой истории: ${status}`);
}

export function buildSeriesMigrationFields(
  series: LegacySeries,
  stories: LegacyStory[]
) {
  const plannedEpisodes = getSeriesEpisodePlan(series.premise);
  const completedEpisodes = stories.filter(
    (story) =>
      story.series_id === series.id &&
      mapLegacyStoryStatus(story.status) === "completed"
  ).length;

  return {
    planned_episodes: plannedEpisodes,
    status: completedEpisodes >= plannedEpisodes ? ("completed" as const) : ("active" as const),
    model_code: "gpt-5.6-terra",
    series_memory: EMPTY_SERIES_MEMORY,
    private_aliases: {},
    creation_key: null,
    last_error: null,
    generation_started_at: null
  };
}

export function buildStoryMigrationFields(status: string) {
  return {
    status: mapLegacyStoryStatus(status),
    summary: null,
    generation_input: {},
    generation_key: null,
    generation_started_at: null
  };
}

export function buildPlanMigrationFields(code: string) {
  const isPremium = code === "unlimited-premium";
  const isUnlimited = isPremium || code === "unlimited-plus";

  return {
    billing_period: "month" as const,
    is_unlimited: isUnlimited,
    model_code: isPremium ? "gpt-5.6-sol" : "gpt-5.6-terra"
  };
}
