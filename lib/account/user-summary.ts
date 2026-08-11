import { queryDatabase } from "@/lib/db/client";

export type UserSummary = {
  storiesCount: number;
  subscriptionStatus: string;
};

export async function getUserSummary(userId: string): Promise<UserSummary> {
  const result = await queryDatabase<{
    stories_count: number;
    subscription_status: string;
  }>(
    `
      select
        (
          select count(*)::integer
          from public.stories
          where user_id = $1
        ) as stories_count,
        coalesce(
          (
            select subscription_status
            from public.profiles
            where id = $1
          ),
          'free'
        ) as subscription_status
    `,
    [userId]
  );
  const summary = result.rows[0];

  return {
    storiesCount: summary?.stories_count ?? 0,
    subscriptionStatus: summary?.subscription_status ?? "free"
  };
}
