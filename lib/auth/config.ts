import { z } from "zod";

const authBackendSchema = z.enum(["supabase", "better-auth"]);

const localAuthEnvSchema = z
  .object({
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(20).default(4),
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
        "DATABASE_URL должна быть строкой подключения PostgreSQL"
      ),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional()
  })
  .superRefine((value, context) => {
    if (Boolean(value.GOOGLE_CLIENT_ID) !== Boolean(value.GOOGLE_CLIENT_SECRET)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Для входа через Google нужны GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET"
      });
    }
  });

export type AuthBackend = z.infer<typeof authBackendSchema>;

export function parseAuthBackend(value?: string): AuthBackend {
  return authBackendSchema.parse(value ?? "supabase");
}

export function usesLocalAuth() {
  return parseAuthBackend(process.env.AUTH_BACKEND) === "better-auth";
}

export function usesLegacyAuthBridge() {
  return process.env.LEGACY_AUTH_BRIDGE_ENABLED === "true";
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
    DATABASE_URL: process.env.DATABASE_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
  });
}
