import { describe, expect, test } from "bun:test";
import {
  parseAuthBackend,
  parseLocalAuthEnv,
  usesLegacyAuthBridge
} from "@/lib/auth/config";

const validEnv = {
  BETTER_AUTH_SECRET: "тестовый-секрет-длиной-больше-тридцати-двух-символов",
  BETTER_AUTH_URL: "https://magicstory.example",
  DATABASE_URL: "postgresql://app:secret@127.0.0.1:5432/magicstory"
};

describe("конфигурация авторизации", () => {
  test("по умолчанию оставляет Supabase Auth", () => {
    expect(parseAuthBackend()).toBe("supabase");
  });

  test("разрешает включить Better Auth явно", () => {
    expect(parseAuthBackend("better-auth")).toBe("better-auth");
  });

  test("требует обе настройки Google одновременно", () => {
    let rejected = false;

    try {
      parseLocalAuthEnv({
        ...validEnv,
        GOOGLE_CLIENT_ID: "client-id"
      });
    } catch {
      rejected = true;
    }

    expect(rejected).toBe(true);
  });

  test("принимает полную локальную конфигурацию", () => {
    expect(
      parseLocalAuthEnv({
        ...validEnv,
        GOOGLE_CLIENT_ID: "client-id",
        GOOGLE_CLIENT_SECRET: "client-secret"
      }).DATABASE_POOL_MAX
    ).toBe(4);
  });

  test("включает мост старых паролей только явным значением true", () => {
    const previousValue = process.env.LEGACY_AUTH_BRIDGE_ENABLED;

    process.env.LEGACY_AUTH_BRIDGE_ENABLED = "false";
    expect(usesLegacyAuthBridge()).toBe(false);

    process.env.LEGACY_AUTH_BRIDGE_ENABLED = "true";
    expect(usesLegacyAuthBridge()).toBe(true);

    if (previousValue === undefined) {
      delete process.env.LEGACY_AUTH_BRIDGE_ENABLED;
    } else {
      process.env.LEGACY_AUTH_BRIDGE_ENABLED = previousValue;
    }
  });
});
