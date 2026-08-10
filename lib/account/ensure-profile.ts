import "server-only";

import { queryDatabase } from "@/lib/db/client";
import { usesPostgresDataBackend } from "@/lib/data/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function ensureUserProfile(userId: string, email?: string | null) {
  if (usesPostgresDataBackend()) {
    await queryDatabase(
      `
        insert into public.profiles (id, email)
        values ($1, $2)
        on conflict (id) do update
        set email = excluded.email
      `,
      [userId, email ?? null]
    );
    return;
  }

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
