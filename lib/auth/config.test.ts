import { describe, expect, test } from "bun:test";
import {
  parseAuthEnabled,
  parseLocalAuthEnv
} from "@/lib/auth/config";

const validEnv = {
  BETTER_AUTH_SECRET: "тестовый-секрет-длиной-больше-тридцати-двух-символов",
  BETTER_AUTH_URL: "https://magicstory.example",
  DATABASE_URL: "postgresql://app:secret@127.0.0.1:5432/magicstory"
};

describe("конфигурация авторизации", () => {
  test("по умолчанию запрещает приём паролей", () => {
    expect(parseAuthEnabled()).toBe(false);
  });

  test("включает авторизацию только явным значением true", () => {
    expect(parseAuthEnabled("true")).toBe(true);
    expect(parseAuthEnabled("false")).toBe(false);
  });

  test("принимает полную локальную конфигурацию", () => {
    expect(parseLocalAuthEnv(validEnv).DATABASE_POOL_MAX).toBe(4);
  });
});
