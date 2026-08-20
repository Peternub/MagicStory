import { describe, expect, test } from "bun:test";
import { TelegramCommandRouter } from "./commands";

describe("безопасность Telegram-команд", () => {
  test("игнорирует chat вне whitelist", async () => {
    const sent: string[] = [];
    const router = new TelegramCommandRouter({
      allowedChatIds: new Set(["100"]),
      sendMessage: async (_chat, text) => { sent.push(text); },
      generateToday: async () => "REPORT",
      getStatus: async () => "STATUS",
      now: () => 10_000
    });
    await router.handle({ update_id: 1, message: { text: "/today", chat: { id: 999 } } });
    expect(sent).toEqual([]);
  });

  test("обрабатывает только /today и /status", async () => {
    const sent: string[] = [];
    let now = 10_000;
    const router = new TelegramCommandRouter({
      allowedChatIds: new Set(["100"]),
      sendMessage: async (_chat, text) => { sent.push(text); },
      generateToday: async () => "REPORT",
      getStatus: async () => "STATUS",
      now: () => now
    });
    await router.handle({ update_id: 1, message: { text: "/today", chat: { id: 100 } } });
    now += 6_000;
    await router.handle({ update_id: 2, message: { text: "/status", chat: { id: 100 } } });
    now += 6_000;
    await router.handle({ update_id: 3, message: { text: "/shell", chat: { id: 100 } } });
    expect(sent).toEqual(["REPORT", "STATUS"]);
  });
});
