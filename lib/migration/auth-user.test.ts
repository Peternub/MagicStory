import { describe, expect, test } from "bun:test";
import { buildAuthUserMigrationRecord } from "@/lib/migration/auth-user";

const baseUser = {
  id: "018f0000-0000-7000-8000-000000000001",
  email: "User@Example.com",
  email_confirmed_at: "2026-08-01T10:00:00.000Z",
  created_at: "2026-07-01T10:00:00.000Z",
  updated_at: "2026-08-01T10:00:00.000Z"
};

describe("перенос пользователей авторизации", () => {
  test("сохраняет UUID, подтверждение email и имя", () => {
    expect(
      buildAuthUserMigrationRecord({
        ...baseUser,
        user_metadata: {
          first_name: "Анна",
          last_name: "Петрова",
          avatar_url: "https://example.com/avatar.png"
        }
      })
    ).toEqual({
      id: baseUser.id,
      email: "user@example.com",
      name: "Анна Петрова",
      emailVerified: true,
      image: "https://example.com/avatar.png",
      createdAt: baseUser.created_at,
      updatedAt: baseUser.updated_at
    });
  });

  test("использует часть email, если имя отсутствует", () => {
    expect(
      buildAuthUserMigrationRecord({
        ...baseUser,
        email_confirmed_at: null,
        user_metadata: {}
      }).name
    ).toBe("User");
  });
});
