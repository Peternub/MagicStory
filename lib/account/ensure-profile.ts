import "server-only";

import { queryDatabase } from "@/lib/db/client";

export async function ensureUserProfile(userId: string, email?: string | null) {
  await queryDatabase(
    `
      insert into public.profiles (id, email)
      values ($1, $2)
      on conflict (id) do update
      set email = excluded.email
    `,
    [userId, email ?? null]
  );
}
