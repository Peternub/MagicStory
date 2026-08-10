import { z } from "zod";

const databaseEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
      "DATABASE_URL должна быть строкой подключения PostgreSQL"
    ),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(20).default(10)
});

export function parseDatabaseEnv(source: {
  DATABASE_URL?: string;
  DATABASE_POOL_MAX?: string;
}) {
  const result = databaseEnvSchema.safeParse(source);

  if (!result.success) {
    throw new Error("Не настроено подключение к PostgreSQL", {
      cause: result.error
    });
  }

  return {
    connectionString: result.data.DATABASE_URL,
    poolMax: result.data.DATABASE_POOL_MAX
  };
}

export function getDatabaseConfig() {
  return parseDatabaseEnv({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX
  });
}
