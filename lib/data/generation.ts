import "server-only";

import { z } from "zod";
import { queryDatabase } from "@/lib/db/client";

const seriesReservationSchema = z.object({
  series_id: z.string().uuid(),
  story_id: z.string().uuid()
});

export type SeriesReservationInput = {
  userId: string;
  childId: string;
  title: string;
  premise: string;
  episodeCount: number;
  creationKey: string;
  generationKey: string;
  generationInput: Record<string, unknown>;
  useStarterOffer: boolean;
};

export type EpisodeReservationInput = {
  userId: string;
  seriesId: string;
  generationKey: string;
  generationInput: Record<string, unknown>;
};

export type StoryGenerationState = {
  id: string;
  series_id: string | null;
  status: string;
};

export type GenerationContext = {
  story: {
    id: string;
    child_id: string;
    series_id: string;
    episode_number: number;
    generation_input: unknown;
  };
  child: {
    id: string;
    name: string;
    age: number;
    gender: "boy" | "girl";
    interests: string | null;
    fears: string | null;
    additional_context: string | null;
  };
  series: {
    id: string;
    title: string;
    premise: string;
    planned_episodes: number;
    model_code: string;
    series_memory: unknown;
    private_aliases: unknown;
  };
};

export async function createSeriesWithFirstEpisode(input: SeriesReservationInput) {
  const result = await queryDatabase<{ reservation: unknown }>(
    `
      select public.create_series_with_first_episode(
        $1::uuid,
        $2::uuid,
        $3::text,
        $4::text,
        $5::integer,
        $6::uuid,
        $7::uuid,
        $8::jsonb,
        $9::boolean
      ) as reservation
    `,
    [
      input.userId,
      input.childId,
      input.title,
      input.premise,
      input.episodeCount,
      input.creationKey,
      input.generationKey,
      input.generationInput,
      input.useStarterOffer
    ]
  );
  return seriesReservationSchema.parse(result.rows[0]?.reservation);
}

export async function reserveSeriesEpisode(input: EpisodeReservationInput) {
  const result = await queryDatabase<{ story_id: string | null }>(
    `
      select public.reserve_series_episode(
        $1::uuid,
        $2::uuid,
        $3::uuid,
        $4::jsonb
      ) as story_id
    `,
    [input.userId, input.seriesId, input.generationKey, input.generationInput]
  );
  const storyId = result.rows[0]?.story_id;

  if (!storyId) {
    throw new Error("STORY_RESERVATION_FAILED");
  }

  return storyId;
}

export async function findStoryGenerationState(userId: string, storyId: string) {
  const result = await queryDatabase<StoryGenerationState>(
    `
      select id, series_id, status
      from public.stories
      where id = $2 and user_id = $1
      limit 1
    `,
    [userId, storyId]
  );
  return result.rows[0] ?? null;
}

export async function claimStoryGeneration(userId: string, storyId: string) {
  const result = await queryDatabase<{ claimed: boolean }>(
    "select public.claim_story_generation($1::uuid, $2::uuid) as claimed",
    [userId, storyId]
  );
  return result.rows[0]?.claimed ?? false;
}

export async function getGenerationContext(userId: string, storyId: string) {
  const result = await queryDatabase<{
    story_id: string;
    child_id: string;
    series_id: string;
    episode_number: number;
    generation_input: unknown;
    child_name: string;
    child_age: number;
    child_gender: "boy" | "girl";
    child_interests: string | null;
    child_fears: string | null;
    child_additional_context: string | null;
    series_title: string;
    series_premise: string;
    planned_episodes: number;
    model_code: string;
    series_memory: unknown;
    private_aliases: unknown;
  }>(
    `
      select
        story.id as story_id,
        story.child_id,
        story.series_id,
        story.episode_number,
        story.generation_input,
        child.name as child_name,
        child.age as child_age,
        child.gender as child_gender,
        child.interests as child_interests,
        child.fears as child_fears,
        child.additional_context as child_additional_context,
        series.title as series_title,
        series.premise as series_premise,
        series.planned_episodes,
        series.model_code,
        series.series_memory,
        series.private_aliases
      from public.stories story
      join public.children child
        on child.id = story.child_id and child.user_id = $1
      join public.story_series series
        on series.id = story.series_id and series.user_id = $1
      where story.id = $2 and story.user_id = $1
      limit 1
    `,
    [userId, storyId]
  );
  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    story: {
      id: row.story_id,
      child_id: row.child_id,
      series_id: row.series_id,
      episode_number: row.episode_number,
      generation_input: row.generation_input
    },
    child: {
      id: row.child_id,
      name: row.child_name,
      age: row.child_age,
      gender: row.child_gender,
      interests: row.child_interests,
      fears: row.child_fears,
      additional_context: row.child_additional_context
    },
    series: {
      id: row.series_id,
      title: row.series_title,
      premise: row.series_premise,
      planned_episodes: row.planned_episodes,
      model_code: row.model_code,
      series_memory: row.series_memory,
      private_aliases: row.private_aliases
    }
  } satisfies GenerationContext;
}

export async function completeStoryGeneration(input: {
  userId: string;
  storyId: string;
  title: string;
  text: string;
  summary: string;
  provider: string;
  memory: unknown;
  privateAliases: unknown;
}) {
  const result = await queryDatabase<{ series_id: string | null }>(
    `
      select public.complete_story_generation(
        $1::uuid,
        $2::uuid,
        $3::text,
        $4::text,
        $5::text,
        $6::text,
        $7::jsonb,
        $8::jsonb
      ) as series_id
    `,
    [
      input.userId,
      input.storyId,
      input.title,
      input.text,
      input.summary,
      input.provider,
      input.memory,
      input.privateAliases
    ]
  );
  const seriesId = result.rows[0]?.series_id;

  if (!seriesId) {
    throw new Error("STORY_COMPLETION_FAILED");
  }

  return seriesId;
}

export async function failStoryGeneration(
  userId: string,
  storyId: string,
  failureMessage: string
) {
  await queryDatabase(
    "select public.fail_story_generation($1::uuid, $2::uuid, $3::text)",
    [userId, storyId, failureMessage]
  );
}

export async function recordGenerationAnalytics(input: {
  requestId: string;
  storyId: string;
  status: "succeeded" | "failed";
  provider: string;
  model: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number | null;
  errorCategory: string | null;
}) {
  await queryDatabase(
    `
      select public.record_analytics_generation_event(
        $1::text,
        $2::uuid,
        $3::text,
        $4::text,
        $5::text,
        $6::integer,
        $7::integer,
        $8::integer,
        $9::numeric,
        $10::text
      )
    `,
    [
      input.requestId,
      input.storyId,
      input.status,
      input.provider,
      input.model,
      input.latencyMs,
      input.inputTokens,
      input.outputTokens,
      input.estimatedCostUsd,
      input.errorCategory
    ]
  );
}
