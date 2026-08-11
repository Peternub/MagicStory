import { describe, expect, test } from "bun:test";
import {
  hashLocalPassword,
  localPasswordNeedsRehash,
  verifyLocalPassword
} from "@/lib/auth/password";

describe("локальное хранение паролей", () => {
  test("создаёт и проверяет Argon2id-хеш", async () => {
    const password = "Надёжный-пароль-2026";
    const hash = await hashLocalPassword(password);

    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(await verifyLocalPassword({ hash, password })).toBe(true);
    expect(await verifyLocalPassword({ hash, password: "другой-пароль" })).toBe(false);
    expect(localPasswordNeedsRehash(hash)).toBe(false);
  });

  test("отклоняет неизвестный формат хеша", async () => {
    expect(
      await verifyLocalPassword({
        hash: "sha256:неподдерживаемый-хеш",
        password: "любой-пароль"
      })
    ).toBe(false);
  });
});
