import { z } from "zod";

const authEnabledSchema = z.enum(["true", "false"]).default("false");

const localAuthEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(20).default(4),
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
      "DATABASE_URL должна быть строкой подключения PostgreSQL"
    )
});

export function parseAuthEnabled(value?: string) {
  return authEnabledSchema.parse(value ?? "false") === "true";
}

export function isAuthEnabled() {
  return parseAuthEnabled(process.env.AUTH_ENABLED);
}

export function parseLocalAuthEnv(source: Record<string, string | undefined>) {
  const result = localAuthEnvSchema.safeParse(source);

  if (!result.success) {
    throw new Error("Не настроена локальная авторизация", {
      cause: result.error
    });
  }

  return result.data;
}

export function getLocalAuthEnv() {
  return parseLocalAuthEnv({
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX,
    DATABASE_URL: process.env.DATABASE_URL
  });
}
