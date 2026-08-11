import "server-only";

import { queryDatabase } from "@/lib/db/client";

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

export async function findSeriesDetailsByUser(userId: string, seriesId: string) {
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
