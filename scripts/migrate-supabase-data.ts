import { Pool, type PoolClient } from "pg";
import { z } from "zod";

import { getDatabaseConfig } from "@/lib/db/config";
import {
  buildPlanMigrationFields,
  buildSeriesMigrationFields,
  buildStoryMigrationFields,
  shouldMigrateLegacyStory
} from "@/lib/migration/legacy-supabase";

const PAGE_SIZE = 1_000;
const CONFIRMATION_VALUE = "SUPABASE_TO_POSTGRES";

const migrationEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  MIGRATION_CONFIRM: z.literal(CONFIRMATION_VALUE)
});

const uuid = z.string().uuid();
const nullableText = z.string().nullable();
const timestamp = z.string().min(1);

const profileSchema = z.object({
  id: uuid,
  email: nullableText,
  subscription_status: z.string(),
  stories_balance: z.number().int(),
  created_at: timestamp,
  updated_at: timestamp
});

const childSchema = z.object({
  id: uuid,
  user_id: uuid,
  name: z.string(),
  age: z.number().int(),
  gender: z.enum(["boy", "girl"]),
  interests: nullableText,
  fears: nullableText,
  additional_context: nullableText,
  created_at: timestamp,
  updated_at: timestamp
});

const storySeriesSchema = z.object({
  id: uuid,
  user_id: uuid,
  child_id: uuid,
  title: z.string(),
  premise: z.string(),
  created_at: timestamp,
  updated_at: timestamp
});

const storySchema = z.object({
  id: uuid,
  user_id: uuid,
  child_id: uuid.nullable(),
  series_id: uuid.nullable(),
  episode_number: z.number().int().nullable(),
  theme: z.string(),
  title: nullableText,
  text_content: nullableText,
  status: z.string(),
  provider_llm: nullableText,
  error_message: nullableText,
  audio_path: nullableText,
  audio_url: nullableText,
  created_at: timestamp,
  updated_at: timestamp
});

const usageEventSchema = z.object({
  id: uuid,
  user_id: uuid,
  story_id: uuid.nullable(),
  event_type: z.string(),
  amount: z.number().int(),
  created_at: timestamp
});

const subscriptionPlanSchema = z.object({
  id: uuid,
  code: z.string(),
  name: z.string(),
  description: nullableText,
  price_rub: z.number().int(),
  stories_limit: z.number().int(),
  is_active: z.boolean(),
  created_at: timestamp
});

const subscriptionSchema = z.object({
  id: uuid,
  user_id: uuid,
  plan_id: uuid,
  status: z.string(),
  started_at: timestamp.nullable(),
  current_period_end: timestamp.nullable(),
  canceled_at: timestamp.nullable(),
  external_customer_id: nullableText,
  external_subscription_id: nullableText,
  created_at: timestamp,
  updated_at: timestamp
});

const paymentSchema = z.object({
  id: uuid,
  user_id: uuid,
  subscription_id: uuid.nullable(),
  provider: z.string(),
  status: z.string(),
  amount_rub: z.number().int(),
  currency: z.string(),
  external_payment_id: nullableText,
  idempotency_key: nullableText,
  metadata: z.record(z.unknown()),
  created_at: timestamp,
  updated_at: timestamp,
  paid_at: timestamp.nullable()
});

const starterOfferOrderSchema = z.object({
  id: uuid,
  user_id: uuid,
  price_rub: z.number().int(),
  status: z.string(),
  series_id: uuid.nullable(),
  created_at: timestamp,
  paid_at: timestamp.nullable(),
  consumed_at: timestamp.nullable()
});

type MigrationEnv = z.infer<typeof migrationEnvSchema>;

type SourceTableDefinition<Schema extends z.ZodTypeAny> = {
  name: string;
  columns: string[];
  schema: Schema;
  optional?: boolean;
};

async function fetchSourceTable<Schema extends z.ZodTypeAny>(
  env: MigrationEnv,
  definition: SourceTableDefinition<Schema>
): Promise<Array<z.infer<Schema>>> {
  const rows: unknown[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url = new URL(`/rest/v1/${definition.name}`, env.NEXT_PUBLIC_SUPABASE_URL);
    url.searchParams.set("select", definition.columns.join(","));
    url.searchParams.set("order", "created_at.asc");

    const response = await fetch(url, {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        range: `${offset}-${offset + PAGE_SIZE - 1}`
      }
    });

    if (response.status === 404 && definition.optional) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`SOURCE_${definition.name.toUpperCase()}_${response.status}`);
    }

    const page = await response.json();
    if (!Array.isArray(page)) {
      throw new Error(`SOURCE_${definition.name.toUpperCase()}_INVALID_RESPONSE`);
    }

    rows.push(...page);

    if (page.length < PAGE_SIZE) {
      break;
    }
  }

  return z.array(definition.schema).parse(rows);
}

async function insertRows(
  client: PoolClient,
  table: string,
  columns: string[],
  rows: unknown[][]
) {
  const columnList = columns.map((column) => `"${column}"`).join(", ");
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  const query = `insert into public."${table}" (${columnList}) values (${placeholders})`;

  for (const values of rows) {
    await client.query(query, values);
  }
}

async function assertTargetIsReady(client: PoolClient) {
  const triggers = await client.query<{ trigger_name: string }>(`
    select tgname as trigger_name
    from pg_trigger
    where not tgisinternal
      and tgname in ('stories_require_series', 'children_enforce_limit')
  `);

  if (triggers.rowCount) {
    throw new Error("TARGET_FUNCTIONS_ALREADY_INSTALLED");
  }

  const nonEmptyTables = await client.query<{ table_name: string }>(`
    select table_name
    from (
      select 'profiles' as table_name, count(*) as row_count from public.profiles
      union all select 'children', count(*) from public.children
      union all select 'subscription_plans', count(*) from public.subscription_plans
      union all select 'subscriptions', count(*) from public.subscriptions
      union all select 'payments', count(*) from public.payments
      union all select 'story_series', count(*) from public.story_series
      union all select 'stories', count(*) from public.stories
      union all select 'usage_events', count(*) from public.usage_events
      union all select 'starter_offer_orders', count(*) from public.starter_offer_orders
    ) counts
    where row_count > 0
  `);

  if (nonEmptyTables.rowCount) {
    throw new Error("TARGET_DATABASE_IS_NOT_EMPTY");
  }
}

async function assertTargetCounts(
  client: PoolClient,
  expected: Record<string, number>
) {
  for (const [table, count] of Object.entries(expected)) {
    const result = await client.query<{ row_count: string }>(
      `select count(*)::text as row_count from public."${table}"`
    );
    const actual = Number(result.rows[0]?.row_count ?? -1);

    if (actual !== count) {
      throw new Error(`TARGET_COUNT_MISMATCH_${table.toUpperCase()}`);
    }
  }
}

async function migrate() {
  const env = migrationEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    MIGRATION_CONFIRM: process.env.MIGRATION_CONFIRM
  });

  const [
    profiles,
    children,
    subscriptionPlans,
    subscriptions,
    payments,
    storySeries,
    sourceStories,
    sourceUsageEvents,
    starterOfferOrders
  ] = await Promise.all([
    fetchSourceTable(env, {
      name: "profiles",
      columns: [
        "id",
        "email",
        "subscription_status",
        "stories_balance",
        "created_at",
        "updated_at"
      ],
      schema: profileSchema
    }),
    fetchSourceTable(env, {
      name: "children",
      columns: [
        "id",
        "user_id",
        "name",
        "age",
        "gender",
        "interests",
        "fears",
        "additional_context",
        "created_at",
        "updated_at"
      ],
      schema: childSchema
    }),
    fetchSourceTable(env, {
      name: "subscription_plans",
      columns: [
        "id",
        "code",
        "name",
        "description",
        "price_rub",
        "stories_limit",
        "is_active",
        "created_at"
      ],
      schema: subscriptionPlanSchema
    }),
    fetchSourceTable(env, {
      name: "subscriptions",
      columns: [
        "id",
        "user_id",
        "plan_id",
        "status",
        "started_at",
        "current_period_end",
        "canceled_at",
        "external_customer_id",
        "external_subscription_id",
        "created_at",
        "updated_at"
      ],
      schema: subscriptionSchema
    }),
    fetchSourceTable(env, {
      name: "payments",
      columns: [
        "id",
        "user_id",
        "subscription_id",
        "provider",
        "status",
        "amount_rub",
        "currency",
        "external_payment_id",
        "idempotency_key",
        "metadata",
        "created_at",
        "updated_at",
        "paid_at"
      ],
      schema: paymentSchema
    }),
    fetchSourceTable(env, {
      name: "story_series",
      columns: [
        "id",
        "user_id",
        "child_id",
        "title",
        "premise",
        "created_at",
        "updated_at"
      ],
      schema: storySeriesSchema
    }),
    fetchSourceTable(env, {
      name: "stories",
      columns: [
        "id",
        "user_id",
        "child_id",
        "series_id",
        "episode_number",
        "theme",
        "title",
        "text_content",
        "status",
        "provider_llm",
        "error_message",
        "audio_path",
        "audio_url",
        "created_at",
        "updated_at"
      ],
      schema: storySchema
    }),
    fetchSourceTable(env, {
      name: "usage_events",
      columns: ["id", "user_id", "story_id", "event_type", "amount", "created_at"],
      schema: usageEventSchema
    }),
    fetchSourceTable(env, {
      name: "starter_offer_orders",
      columns: [
        "id",
        "user_id",
        "price_rub",
        "status",
        "series_id",
        "created_at",
        "paid_at",
        "consumed_at"
      ],
      schema: starterOfferOrderSchema,
      optional: true
    })
  ]);

  const stories = sourceStories.filter(shouldMigrateLegacyStory);
  const discardedStoryIds = new Set(
    sourceStories
      .filter((story) => !shouldMigrateLegacyStory(story))
      .map((story) => story.id)
  );
  const usageEvents = sourceUsageEvents.filter(
    (event) => event.story_id === null || !discardedStoryIds.has(event.story_id)
  );

  const counts = {
    profiles: profiles.length,
    children: children.length,
    subscription_plans: subscriptionPlans.length,
    subscriptions: subscriptions.length,
    payments: payments.length,
    story_series: storySeries.length,
    stories: stories.length,
    usage_events: usageEvents.length,
    starter_offer_orders: starterOfferOrders.length
  };

  console.log(
    "Источник прочитан:",
    Object.entries(counts)
      .map(([table, count]) => `${table}=${count}`)
      .join(", ")
  );

  console.log(
    `Исключено старых историй с озвучкой: ${discardedStoryIds.size}; ` +
      `связанных событий: ${sourceUsageEvents.length - usageEvents.length}.`
  );

  const databaseConfig = getDatabaseConfig();
  const pool = new Pool({
    connectionString: databaseConfig.connectionString,
    max: 1,
    connectionTimeoutMillis: 5_000
  });
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock(hashtext('magicstory-data-migration'))");
    await assertTargetIsReady(client);

    await insertRows(
      client,
      "profiles",
      [
        "id",
        "email",
        "first_name",
        "last_name",
        "subscription_status",
        "stories_balance",
        "created_at",
        "updated_at"
      ],
      profiles.map((profile) => [
        profile.id,
        profile.email,
        null,
        null,
        profile.subscription_status,
        profile.stories_balance,
        profile.created_at,
        profile.updated_at
      ])
    );

    await insertRows(
      client,
      "children",
      [
        "id",
        "user_id",
        "name",
        "age",
        "gender",
        "interests",
        "fears",
        "additional_context",
        "created_at",
        "updated_at"
      ],
      children.map((child) => [
        child.id,
        child.user_id,
        child.name,
        child.age,
        child.gender,
        child.interests,
        child.fears,
        child.additional_context,
        child.created_at,
        child.updated_at
      ])
    );

    await insertRows(
      client,
      "subscription_plans",
      [
        "id",
        "code",
        "name",
        "description",
        "price_rub",
        "stories_limit",
        "is_active",
        "billing_period",
        "is_unlimited",
        "model_code",
        "created_at"
      ],
      subscriptionPlans.map((plan) => {
        const fields = buildPlanMigrationFields(plan.code);
        return [
          plan.id,
          plan.code,
          plan.name,
          plan.description,
          plan.price_rub,
          plan.stories_limit,
          plan.is_active,
          fields.billing_period,
          fields.is_unlimited,
          fields.model_code,
          plan.created_at
        ];
      })
    );

    await insertRows(
      client,
      "subscriptions",
      [
        "id",
        "user_id",
        "plan_id",
        "status",
        "started_at",
        "current_period_end",
        "canceled_at",
        "external_customer_id",
        "external_subscription_id",
        "created_at",
        "updated_at"
      ],
      subscriptions.map((subscription) => [
        subscription.id,
        subscription.user_id,
        subscription.plan_id,
        subscription.status,
        subscription.started_at,
        subscription.current_period_end,
        subscription.canceled_at,
        subscription.external_customer_id,
        subscription.external_subscription_id,
        subscription.created_at,
        subscription.updated_at
      ])
    );

    await insertRows(
      client,
      "payments",
      [
        "id",
        "user_id",
        "subscription_id",
        "provider",
        "status",
        "amount_rub",
        "currency",
        "external_payment_id",
        "idempotency_key",
        "metadata",
        "created_at",
        "updated_at",
        "paid_at"
      ],
      payments.map((payment) => [
        payment.id,
        payment.user_id,
        payment.subscription_id,
        payment.provider,
        payment.status,
        payment.amount_rub,
        payment.currency,
        payment.external_payment_id,
        payment.idempotency_key,
        payment.metadata,
        payment.created_at,
        payment.updated_at,
        payment.paid_at
      ])
    );

    await insertRows(
      client,
      "story_series",
      [
        "id",
        "user_id",
        "child_id",
        "title",
        "premise",
        "planned_episodes",
        "status",
        "model_code",
        "series_memory",
        "private_aliases",
        "creation_key",
        "last_error",
        "generation_started_at",
        "created_at",
        "updated_at"
      ],
      storySeries.map((series) => {
        const fields = buildSeriesMigrationFields(series, stories);
        return [
          series.id,
          series.user_id,
          series.child_id,
          series.title,
          series.premise,
          fields.planned_episodes,
          fields.status,
          fields.model_code,
          fields.series_memory,
          fields.private_aliases,
          fields.creation_key,
          fields.last_error,
          fields.generation_started_at,
          series.created_at,
          series.updated_at
        ];
      })
    );

    await insertRows(
      client,
      "stories",
      [
        "id",
        "user_id",
        "child_id",
        "series_id",
        "episode_number",
        "theme",
        "title",
        "text_content",
        "summary",
        "status",
        "provider_llm",
        "error_message",
        "generation_input",
        "generation_key",
        "generation_started_at",
        "created_at",
        "updated_at"
      ],
      stories.map((story) => {
        const fields = buildStoryMigrationFields(story.status);
        return [
          story.id,
          story.user_id,
          story.child_id,
          story.series_id,
          story.episode_number,
          story.theme,
          story.title,
          story.text_content,
          fields.summary,
          fields.status,
          story.provider_llm,
          story.error_message,
          fields.generation_input,
          fields.generation_key,
          fields.generation_started_at,
          story.created_at,
          story.updated_at
        ];
      })
    );

    await insertRows(
      client,
      "usage_events",
      ["id", "user_id", "story_id", "event_type", "amount", "created_at"],
      usageEvents.map((event) => [
        event.id,
        event.user_id,
        event.story_id,
        event.event_type,
        event.amount,
        event.created_at
      ])
    );

    await insertRows(
      client,
      "starter_offer_orders",
      [
        "id",
        "user_id",
        "price_rub",
        "status",
        "series_id",
        "created_at",
        "paid_at",
        "consumed_at"
      ],
      starterOfferOrders.map((order) => [
        order.id,
        order.user_id,
        order.price_rub,
        order.status,
        order.series_id,
        order.created_at,
        order.paid_at,
        order.consumed_at
      ])
    );

    await assertTargetCounts(client, counts);
    await client.query("commit");
    console.log("Перенос данных завершён, количества записей совпадают.");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error: unknown) => {
  if (error instanceof z.ZodError) {
    const paths = error.issues.map((issue) => issue.path.join(".")).join(", ");
    console.error(`Перенос отменён: неверный формат полей (${paths}).`);
  } else if (error instanceof Error) {
    console.error(`Перенос отменён: ${error.message}.`);
  } else {
    console.error("Перенос отменён: неизвестная ошибка.");
  }

  process.exitCode = 1;
});
