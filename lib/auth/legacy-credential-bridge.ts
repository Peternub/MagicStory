import "server-only";

import { createClient } from "@supabase/supabase-js";
import { hashLocalPassword } from "@/lib/auth/password";
import { getDatabasePool, queryDatabase } from "@/lib/db/client";
import { getPublicSupabaseEnv } from "@/lib/supabase/config";

export async function migrateLegacyCredential(email: string, password: string) {
  try {
    const localUser = await queryDatabase<{ id: string }>(
      `
        select "id"::text as id
        from public."user"
        where lower("email") = lower($1)
      `,
      [email]
    );
    const localUserId = localUser.rows[0]?.id;

    if (!localUserId) {
      return false;
    }

    const env = getPublicSupabaseEnv();
    const legacyAuth = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false
        }
      }
    );
    const { data, error } = await legacyAuth.auth.signInWithPassword({ email, password });

    if (error || data.user?.id !== localUserId) {
      return false;
    }

    const passwordHash = await hashLocalPassword(password);
    const databaseClient = await getDatabasePool().connect();

    try {
      await databaseClient.query("begin");
      await databaseClient.query(
        "select pg_advisory_xact_lock(hashtextextended($1, 0))",
        [localUserId]
      );
      const existingCredential = await databaseClient.query<{ id: string }>(
        `
          select "id"::text as id
          from public."account"
          where "userId" = $1 and "providerId" = 'credential'
          limit 1
        `,
        [localUserId]
      );

      if (existingCredential.rowCount) {
        await databaseClient.query("rollback");
        return false;
      }

      await databaseClient.query(
        `
          insert into public."account" (
            "id",
            "accountId",
            "providerId",
            "userId",
            "password",
            "createdAt",
            "updatedAt"
          )
          values (gen_random_uuid(), $1, 'credential', $1, $2, now(), now())
        `,
        [localUserId, passwordHash]
      );
      await databaseClient.query("commit");
      return true;
    } catch {
      await databaseClient.query("rollback").catch(() => undefined);
      return false;
    } finally {
      databaseClient.release();
    }
  } catch {
    return false;
  }
}
