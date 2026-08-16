import { describe, expect, test } from "bun:test";

import { parseDatabaseEnv } from "@/lib/db/config";

describe("parseDatabaseEnv", () => {
  test("принимает строку подключения PostgreSQL", () => {
    expect(
      parseDatabaseEnv({
        DATABASE_URL: "postgresql://skazkids_app:secret@127.0.0.1:5432/skazkids",
        DATABASE_POOL_MAX: "8"
      })
    ).toEqual({
      connectionString: "postgresql://skazkids_app:secret@127.0.0.1:5432/skazkids",
      poolMax: 8
    });
  });

  test("не принимает строку подключения другого типа", () => {
    let errorMessage = "";

    try {
      parseDatabaseEnv({
        DATABASE_URL: "https://example.com/database"
      });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }

    expect(errorMessage).toBe("Не настроено подключение к PostgreSQL");
  });

  test("использует безопасный размер пула по умолчанию", () => {
    expect(
      parseDatabaseEnv({
        DATABASE_URL: "postgresql://skazkids_app:secret@127.0.0.1:5432/skazkids"
      }).poolMax
    ).toBe(10);
  });
});
