import { redirect } from "next/navigation";
import { queryDatabase } from "@/lib/db/client";
import { usesPostgresDataBackend } from "@/lib/data/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOnboardingState(userId: string) {
  if (usesPostgresDataBackend()) {
    const result = await queryDatabase<{ has_stories: boolean }>(
      `
        select exists(
          select 1
          from public.stories
          where user_id = $1
        ) as has_stories
      `,
      [userId]
    );

    return {
      hasStories: result.rows[0]?.has_stories ?? false
    };
  }

  const supabase = await createSupabaseServerClient();
  const { count: storiesCount } = await supabase
    .from("stories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  return {
    hasStories: (storiesCount ?? 0) > 0
  };
}

export async function redirectToNextOnboardingStep() {
  redirect("/dashboard");
}
