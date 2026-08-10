import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getLocalAuthEnv } from "@/lib/auth/config";
import {
  hashLocalPassword,
  verifyLocalPassword
} from "@/lib/auth/password";

const authEnv = getLocalAuthEnv();
const authDatabase = new Pool({
  connectionString: authEnv.DATABASE_URL,
  max: Math.min(authEnv.DATABASE_POOL_MAX, 4),
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000
});

const socialProviders = authEnv.GOOGLE_CLIENT_ID && authEnv.GOOGLE_CLIENT_SECRET
  ? {
      google: {
        clientId: authEnv.GOOGLE_CLIENT_ID,
        clientSecret: authEnv.GOOGLE_CLIENT_SECRET
      }
    }
  : undefined;

export const auth = betterAuth({
  appName: "MagicStory",
  basePath: "/api/auth",
  baseURL: authEnv.BETTER_AUTH_URL,
  database: authDatabase,
  secret: authEnv.BETTER_AUTH_SECRET,
  advanced: {
    cookiePrefix: "magicstory",
    database: {
      generateId: "uuid"
    }
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    password: {
      hash: hashLocalPassword,
      verify: verifyLocalPassword
    }
  },
  socialProviders,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await authDatabase.query(
            `
              insert into public.profiles (id, email)
              values ($1, $2)
              on conflict (id) do update
              set email = excluded.email
            `,
            [user.id, user.email]
          );
        }
      },
      delete: {
        after: async (user) => {
          await authDatabase.query(
            "delete from public.profiles where id = $1",
            [user.id]
          );
        }
      }
    }
  },
  plugins: [nextCookies()]
});

export const localAuth = auth;
