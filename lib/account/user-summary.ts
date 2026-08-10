import { queryDatabase } from "@/lib/db/client";
import { usesPostgresDataBackend } from "@/lib/data/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserSummary = {
  storiesCount: number;
  subscriptionStatus: string;
};

export async function getUserSummary(userId: string): Promise<UserSummary> {
  if (usesPostgresDataBackend()) {
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

  const supabase = await createSupabaseServerClient();

  const [{ data: profile }, { count: storiesCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", userId)
      .single(),
    supabase
      .from("stories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
  ]);

  return {
    storiesCount: storiesCount ?? 0,
    subscriptionStatus: profile?.subscription_status ?? "free"
  };
}
