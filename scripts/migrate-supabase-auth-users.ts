import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { Pool } from "pg";
import { z } from "zod";
import { getDatabaseConfig } from "@/lib/db/config";
import { buildAuthUserMigrationRecord } from "@/lib/migration/auth-user";

const PAGE_SIZE = 1_000;
const CONFIRMATION_VALUE = "SUPABASE_AUTH_USERS_TO_POSTGRES";

const migrationEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  AUTH_MIGRATION_CONFIRM: z.literal(CONFIRMATION_VALUE)
});

async function listAllUsers(supabase: SupabaseClient) {
  const users: User[] = [];

  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE
    });

    if (error) {
      throw new Error(`SUPABASE_AUTH_USERS_FAILED_${error.status ?? "UNKNOWN"}`);
    }

    users.push(...data.users);

    if (data.users.length < PAGE_SIZE) {
      return users;
    }
  }
}

async function migrateAuthUsers() {
  const env = migrationEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    AUTH_MIGRATION_CONFIRM: process.env.AUTH_MIGRATION_CONFIRM
  });
  const database = getDatabaseConfig();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  const sourceUsers = (await listAllUsers(supabase)).map(buildAuthUserMigrationRecord);
  const pool = new Pool({
    connectionString: database.connectionString,
    max: 1
  });
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock(hashtext('magicstory-auth-user-migration'))");

    for (const user of sourceUsers) {
      await client.query(
        `
          insert into public."user" (
            "id",
            "name",
            "email",
            "emailVerified",
            "image",
            "createdAt",
            "updatedAt"
          )
          values ($1, $2, $3, $4, $5, $6, $7)
          on conflict ("id") do update
          set
            "name" = excluded."name",
            "email" = excluded."email",
            "emailVerified" = excluded."emailVerified",
            "image" = excluded."image",
            "updatedAt" = excluded."updatedAt"
        `,
        [
          user.id,
          user.name,
          user.email,
          user.emailVerified,
          user.image,
          user.createdAt,
          user.updatedAt
        ]
      );
    }

    const result = await client.query<{ migrated_count: number }>(
      `
        select count(*)::integer as migrated_count
        from public."user"
        where "id" = any($1::uuid[])
      `,
      [sourceUsers.map((user) => user.id)]
    );
    const migratedCount = result.rows[0]?.migrated_count ?? 0;

    if (migratedCount !== sourceUsers.length) {
      throw new Error("AUTH_USER_COUNT_MISMATCH");
    }

    await client.query("commit");
    console.log(`Перенесено карточек пользователей: ${migratedCount}.`);
    console.log("Пароли и активные сессии не изменены.");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateAuthUsers().catch((error: unknown) => {
  if (error instanceof z.ZodError) {
    const paths = error.issues.map((issue) => issue.path.join(".")).join(", ");
    console.error(`Перенос пользователей отменён: неверные настройки (${paths}).`);
  } else if (error instanceof Error) {
    console.error(`Перенос пользователей отменён: ${error.message}.`);
  } else {
    console.error("Перенос пользователей отменён: неизвестная ошибка.");
  }

  process.exitCode = 1;
});
