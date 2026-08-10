import "server-only";

import { queryDatabase } from "@/lib/db/client";
import { usesPostgresDataBackend } from "@/lib/data/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SeriesEpisodePreview = {
  id: string;
  title: string | null;
  status: string;
  episode_number: number | null;
};

export type SeriesPreview = {
  children: Array<{ name: string }>;
  id: string;
  premise: string;
  planned_episodes: number;
  status: string;
  stories: SeriesEpisodePreview[];
  title: string;
  updated_at: string;
};

export type SeriesDetails = {
  children: Array<{ name: string }>;
  id: string;
  child_id: string;
  title: string;
  premise: string;
  planned_episodes: number;
  status: string;
};

export type SeriesDetailsEpisode = SeriesEpisodePreview & {
  error_message: string | null;
  generation_started_at: string | null;
  created_at: string;
};

export async function listSeriesByUser(userId: string) {
  if (usesPostgresDataBackend()) {
    const result = await queryDatabase<SeriesPreview>(
      `
        select
          series.id,
          series.title,
          series.premise,
          series.planned_episodes,
          series.status,
          series.updated_at,
          jsonb_build_array(jsonb_build_object('name', child.name)) as children,
          coalesce(
            (
              select jsonb_agg(
                jsonb_build_object(
                  'id', story.id,
                  'title', story.title,
                  'status', story.status,
                  'episode_number', story.episode_number
                )
                order by story.episode_number
              )
              from public.stories story
              where story.series_id = series.id and story.user_id = $1
            ),
            '[]'::jsonb
          ) as stories
        from public.story_series series
        join public.children child
          on child.id = series.child_id and child.user_id = $1
        where series.user_id = $1
        order by series.updated_at desc
      `,
      [userId]
    );
    return result.rows;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("story_series")
    .select(
      "id, title, premise, planned_episodes, status, updated_at, children(name), stories(id, title, status, episode_number)"
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("SERIES_LIST_FAILED");
  }

  return (data ?? []) as SeriesPreview[];
}

export async function findSeriesDetailsByUser(userId: string, seriesId: string) {
  if (usesPostgresDataBackend()) {
    const [seriesResult, episodesResult] = await Promise.all([
      queryDatabase<SeriesDetails>(
        `
          select
            series.id,
            series.child_id,
            series.title,
            series.premise,
            series.planned_episodes,
            series.status,
            jsonb_build_array(jsonb_build_object('name', child.name)) as children
          from public.story_series series
          join public.children child
            on child.id = series.child_id and child.user_id = $1
          where series.id = $2 and series.user_id = $1
          limit 1
        `,
        [userId, seriesId]
      ),
      queryDatabase<SeriesDetailsEpisode>(
        `
          select
            id,
            title,
            status,
            episode_number,
            error_message,
            generation_started_at,
            created_at
          from public.stories
          where series_id = $2 and user_id = $1
          order by episode_number asc
        `,
        [userId, seriesId]
      )
    ]);

    return {
      series: seriesResult.rows[0] ?? null,
      episodes: episodesResult.rows
    };
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: series, error: seriesError }, { data: episodes, error: episodesError }] =
    await Promise.all([
      supabase
        .from("story_series")
        .select("id, child_id, title, premise, planned_episodes, status, children(name)")
        .eq("id", seriesId)
        .eq("user_id", userId)
        .single(),
      supabase
        .from("stories")
        .select(
          "id, title, status, episode_number, error_message, generation_started_at, created_at"
        )
        .eq("series_id", seriesId)
        .eq("user_id", userId)
        .order("episode_number", { ascending: true })
    ]);

  return {
    series: seriesError ? null : (series as SeriesDetails),
    episodes: episodesError ? [] : ((episodes ?? []) as SeriesDetailsEpisode[])
  };
}
