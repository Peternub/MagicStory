import "server-only";

import { queryDatabase } from "@/lib/db/client";

export type StoryListItem = {
  id: string;
  title: string | null;
  theme: string;
  status: string;
  created_at: string;
};

export type StoryDetails = StoryListItem & {
  series_id: string;
  text_content: string | null;
  error_message: string | null;
};

export async function listStoriesByUser(userId: string) {
  const result = await queryDatabase<StoryListItem>(
    `
      select id, title, theme, status, created_at
      from public.stories
      where user_id = $1 and series_id is not null
      order by created_at desc
    `,
    [userId]
  );
  return result.rows;
}

export async function findStoryDetailsByUser(userId: string, storyId: string) {
  const result = await queryDatabase<StoryDetails>(
    `
      select
        id,
        series_id,
        title,
        theme,
        text_content,
        status,
        error_message,
        created_at
      from public.stories
      where id = $2 and user_id = $1 and series_id is not null
      limit 1
    `,
    [userId, storyId]
  );
  return result.rows[0] ?? null;
}
