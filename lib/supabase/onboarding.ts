import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOnboardingState(userId: string) {
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
