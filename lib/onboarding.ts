import { redirect } from "next/navigation";
import { queryDatabase } from "@/lib/db/client";

export async function getOnboardingState(userId: string) {
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

export async function redirectToNextOnboardingStep() {
  redirect("/dashboard");
}
