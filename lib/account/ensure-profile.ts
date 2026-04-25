import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function ensureUserProfile(userId: string, email?: string | null) {
  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient.from("profiles").upsert(
    {
      id: userId,
      email: email ?? null
    },
    {
      onConflict: "id"
    }
  );

  if (error) {
    console.error("ensureUserProfile error", {
      userId,
      message: error.message,
      code: error.code
    });
    throw error;
  }
}
