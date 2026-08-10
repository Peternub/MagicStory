import { describe, expect, test } from "bun:test";
import bcrypt from "bcrypt";
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

  test("проверяет старый bcrypt-хеш Supabase", async () => {
    const password = "Старый-пароль-2026";
    const hash = await bcrypt.hash(password, 10);

    expect(await verifyLocalPassword({ hash, password })).toBe(true);
    expect(await verifyLocalPassword({ hash, password: "другой-пароль" })).toBe(false);
    expect(localPasswordNeedsRehash(hash)).toBe(true);
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
