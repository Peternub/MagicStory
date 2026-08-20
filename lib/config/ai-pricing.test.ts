import { describe, expect, test } from "bun:test";
import { estimateAiCostUsd, parseAiPricingConfig } from "./ai-pricing";

describe("централизованные цены AI", () => {
  test("считает стоимость без участия LLM", () => {
    const cost = estimateAiCostUsd({
      model: "test-model",
      inputTokens: 1_000_000,
      outputTokens: 500_000,
      config: {
        "test-model": { inputPerMillionUsd: 2, outputPerMillionUsd: 8 }
      }
    });
    expect(cost).toBe(6);
  });

  test("не подставляет ноль для модели без цены", () => {
    expect(estimateAiCostUsd({
      model: "unknown",
      inputTokens: 10,
      outputTokens: 10,
      config: {}
    })).toBe(null);
  });

  test("отклоняет повреждённый config", () => {
    let message = "";
    try {
      parseAiPricingConfig("not-json");
    } catch (error) {
      message = error instanceof Error ? error.message : "UNKNOWN";
    }
    expect(message).toBe("AI_PRICING_CONFIG_INVALID");
  });
});
