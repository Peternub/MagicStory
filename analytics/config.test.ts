import { describe, expect, test } from "bun:test";
import { parseAnalyticsConfig } from "./config";

const baseEnv = {
  ANALYTICS_DATABASE_URL: "postgresql://analytics:secret@127.0.0.1:5432/skazkids",
  ANALYTICS_AI_ENABLED: "false",
  TELEGRAM_BOT_TOKEN: "1234567890:test-token-long-enough",
  TELEGRAM_ALLOWED_CHAT_IDS: "100,200"
};

describe("конфигурация Analytics Service", () => {
  test("разбирает whitelist и безопасные defaults", () => {
    const config = parseAnalyticsConfig(baseEnv);
    expect(config.allowedChatIds).toEqual(["100", "200"]);
    expect(config.timezone).toBe("Europe/Moscow");
    expect(config.alertCooldownMinutes).toBe(360);
  });

  test("не разрешает отправку вне whitelist", () => {
    let message = "";
    try {
      parseAnalyticsConfig({ ...baseEnv, TELEGRAM_REPORT_CHAT_IDS: "300" });
    } catch (error) {
      message = error instanceof Error ? error.message : "UNKNOWN";
    }
    expect(message).toBe("TELEGRAM_REPORT_CHAT_NOT_ALLOWED");
  });

  test("отключает только AI-анализ при отсутствии gateway credentials", () => {
    const config = parseAnalyticsConfig({
      ...baseEnv,
      ANALYTICS_AI_ENABLED: "true"
    });
    expect(config.aiEnabled).toBe(false);
  });
});
