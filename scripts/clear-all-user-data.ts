import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { Pool, type PoolClient } from "pg";
import { z } from "zod";
import { getDatabaseConfig } from "@/lib/db/config";

const CONFIRMATION_VALUE = "DELETE_ALL_MAGICSTORY_USERS_AND_CONTENT";
const PAGE_SIZE = 1_000;

const cleanupEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CLEAR_USER_DATA_CONFIRM: z.literal(CONFIRMATION_VALUE)
});

const sourceTables = [
  "usage_events",
  "payments",
  "starter_offer_orders",
  "stories",
  "story_series",
  "subscriptions",
  "children",
  "profiles"
] as const;

const targetTables = [
  "profiles",
  "children",
  "subscriptions",
  "payments",
  "story_series",
  "stories",
  "usage_events",
  "starter_offer_orders",
  "user",
  "account",
  "session",
  "verification"
] as const;

function isMissingSourceTable(error: { code?: string } | null) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}

async function listAllAuthUsers(supabase: SupabaseClient) {
  const users: User[] = [];

  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE
    });

    if (error) {
      throw new Error(`SUPABASE_AUTH_LIST_FAILED_${error.status ?? "UNKNOWN"}`);
    }

    users.push(...data.users);

    if (data.users.length < PAGE_SIZE) {
      return users;
    }
  }
}

async function clearSupabaseData(supabase: SupabaseClient) {
  const users = await listAllAuthUsers(supabase);

  for (const table of sourceTables) {
    const { error } = await supabase.from(table).delete().not("id", "is", null);

    if (isMissingSourceTable(error)) {
      continue;
    }

    if (error) {
      throw new Error(`SUPABASE_DELETE_${table.toUpperCase()}_${error.code}`);
    }
  }

  for (const user of users) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      throw new Error(`SUPABASE_AUTH_DELETE_FAILED_${error.status ?? "UNKNOWN"}`);
    }
  }
}

async function printDeletionCounts(supabase: SupabaseClient, client: PoolClient) {
  const authUsers = await listAllAuthUsers(supabase);
  console.log(`Supabase Auth: ${authUsers.length}.`);

  for (const table of sourceTables) {
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true });

    if (isMissingSourceTable(error)) {
      console.log(`Supabase ${table}: таблица отсутствует.`);
      continue;
    }

    if (error) {
      throw new Error(`SUPABASE_COUNT_${table.toUpperCase()}_${error.code}`);
    }

    console.log(`Supabase ${table}: ${count ?? 0}.`);
  }

  for (const table of targetTables) {
    const result = await client.query<{ row_count: number }>(
      `select count(*)::integer as row_count from public."${table}"`
    );
    console.log(`PostgreSQL ${table}: ${result.rows[0]?.row_count ?? 0}.`);
  }
}

async function clearPostgresData(client: PoolClient) {
  await client.query("begin");

  try {
    await client.query("select pg_advisory_xact_lock(hashtext('magicstory-clear-user-data'))");
    await client.query("delete from public.verification");
    await client.query("delete from public.profiles");
    await client.query('delete from public."user"');
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

async function assertSupabaseIsEmpty(supabase: SupabaseClient) {
  for (const table of sourceTables) {
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true });

    if (isMissingSourceTable(error)) {
      continue;
    }

    if (error || count !== 0) {
      throw new Error(`SUPABASE_NOT_EMPTY_${table.toUpperCase()}`);
    }
  }

  if ((await listAllAuthUsers(supabase)).length !== 0) {
    throw new Error("SUPABASE_AUTH_NOT_EMPTY");
  }
}

async function assertPostgresIsEmpty(client: PoolClient) {
  for (const table of targetTables) {
    const result = await client.query<{ row_count: number }>(
      `select count(*)::integer as row_count from public."${table}"`
    );

    if (result.rows[0]?.row_count !== 0) {
      throw new Error(`POSTGRES_NOT_EMPTY_${table.toUpperCase()}`);
    }
  }
}

async function clearAllUserData() {
  const env = cleanupEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CLEAR_USER_DATA_CONFIRM: process.env.CLEAR_USER_DATA_CONFIRM
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
  const pool = new Pool({
    connectionString: database.connectionString,
    max: 1
  });
  const client = await pool.connect();

  try {
    await printDeletionCounts(supabase, client);
    await clearSupabaseData(supabase);
    await clearPostgresData(client);
    await assertSupabaseIsEmpty(supabase);
    await assertPostgresIsEmpty(client);
    console.log("Все пользователи и пользовательские данные удалены из Supabase и PostgreSQL.");
  } finally {
    client.release();
    await pool.end();
  }
}

clearAllUserData().catch((error: unknown) => {
  if (error instanceof z.ZodError) {
    const paths = error.issues.map((issue) => issue.path.join(".")).join(", ");
    console.error(`Очистка отменена: неверные настройки (${paths}).`);
  } else if (error instanceof Error) {
    console.error(`Очистка не завершена: ${error.message}.`);
  } else {
    console.error("Очистка не завершена: неизвестная ошибка.");
  }

  process.exitCode = 1;
});
