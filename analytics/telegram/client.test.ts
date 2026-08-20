import { describe, expect, test } from "bun:test";
import { TelegramClient } from "./client";

function telegramResponse(result: unknown, status = 200) {
  return new Response(JSON.stringify({ ok: status === 200, result }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

describe("доставка Telegram", () => {
  test("повторяет временный отказ и не раскрывает token в тексте", async () => {
    let calls = 0;
    const client = new TelegramClient("secret-token-long-enough", async () => {
      calls += 1;
      return calls === 1 ? telegramResponse(null, 503) : telegramResponse({ message_id: 1 });
    });
    await client.sendMessage("100", "Отчёт");
    expect(calls).toBe(2);
  });

  test("останавливается на постоянной ошибке", async () => {
    let message = "";
    const client = new TelegramClient(
      "secret-token-long-enough",
      async () => telegramResponse(null, 400)
    );
    try {
      await client.sendMessage("100", "Отчёт");
    } catch (error) {
      message = error instanceof Error ? error.message : "UNKNOWN";
    }
    expect(message).toBe("TELEGRAM_PERMANENT_FAILURE");
  });
});
