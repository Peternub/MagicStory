import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserSummary = {
  storiesBalance: number;
  storiesCount: number;
  subscriptionStatus: string;
};

export async function getUserSummary(userId: string): Promise<UserSummary> {
  const supabase = await createSupabaseServerClient();

  const [{ data: profile }, { count: storiesCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("stories_balance, subscription_status")
      .eq("id", userId)
      .single(),
    supabase
      .from("stories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
  ]);

  return {
    storiesBalance: profile?.stories_balance ?? 0,
    storiesCount: storiesCount ?? 0,
    subscriptionStatus: profile?.subscription_status ?? "free"
  };
}
