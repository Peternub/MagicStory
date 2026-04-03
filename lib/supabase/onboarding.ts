import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOnboardingState(userId: string) {
  const supabase = await createSupabaseServerClient();

  const [{ count: childrenCount }, { count: storiesCount }] = await Promise.all([
    supabase
      .from("children")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("stories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
  ]);

  return {
    hasChildren: (childrenCount ?? 0) > 0,
    hasStories: (storiesCount ?? 0) > 0
  };
}

export async function redirectToNextOnboardingStep(userId: string) {
  const state = await getOnboardingState(userId);

  if (!state.hasChildren) {
    redirect("/children/new");
  }

  if (!state.hasStories) {
    redirect("/stories/new");
  }
}
