import { describe, expect, test } from "bun:test";

import { parseDataBackend } from "@/lib/data/config";

describe("parseDataBackend", () => {
  test("по умолчанию сохраняет Supabase", () => {
    expect(parseDataBackend()).toBe("supabase");
  });

  test("разрешает явно включить PostgreSQL", () => {
    expect(parseDataBackend("postgres")).toBe("postgres");
  });

  test("отклоняет неизвестное хранилище", () => {
    let errorRaised = false;

    try {
      parseDataBackend("unknown");
    } catch {
      errorRaised = true;
    }

    expect(errorRaised).toBe(true);
  });
});
