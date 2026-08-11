import { describe, expect, test } from "bun:test";
import { createAuthUser } from "@/lib/auth/user";

describe("единый пользователь авторизации", () => {
  test("сохраняет дополнительные метаданные пользователя", () => {
    expect(
      createAuthUser({
        id: "018f0000-0000-7000-8000-000000000001",
        email: "user@example.com",
        metadata: { first_name: "Анна" }
      })
    ).toEqual({
      id: "018f0000-0000-7000-8000-000000000001",
      email: "user@example.com",
      user_metadata: { first_name: "Анна" }
    });
  });

  test("преобразует имя пользователя в привычные метаданные", () => {
    expect(
      createAuthUser({
        id: "018f0000-0000-7000-8000-000000000002",
        email: "local@example.com",
        name: "Иван Петров"
      }).user_metadata
    ).toEqual({ full_name: "Иван Петров" });
  });
});
