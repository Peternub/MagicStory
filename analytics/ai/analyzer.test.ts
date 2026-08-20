import { describe, expect, test } from "bun:test";
import type { NormalizedMetrics, RuleResults } from "../types";
import { analyzeMetrics, buildAiAnalysisPacket } from "./analyzer";

const metrics = {
  period: {}, users: {}, content: {}, ai: {}, collectionWarnings: []
} as unknown as NormalizedMetrics;
const rules: RuleResults = { positiveSignals: [], problems: [], actions: [] };

describe("AI-анализ агрегатов", () => {
  test("валидирует structured output", async () => {
    const analysis = await analyzeMetrics(metrics, rules, async () => ({
      output: JSON.stringify({
        summary: "Данных мало.",
        positiveSignals: [],
        problems: [],
        actions: [{ priority: 1, action: "Наблюдать.", reason: "Малая выборка." }]
      })
    }));
    expect(analysis?.summary).toBe("Данных мало.");
  });

  test("возвращает fallback при недоступности AI", async () => {
    const analysis = await analyzeMetrics(metrics, rules, async () => {
      throw new Error("AI_UNAVAILABLE");
    });
    expect(analysis).toBe(null);
  });

  test("блокирует персональные идентификаторы", () => {
    const unsafe = { ...metrics, collectionWarnings: ["owner@example.com"] };
    let message = "";
    try {
      buildAiAnalysisPacket(unsafe, rules);
    } catch (error) {
      message = error instanceof Error ? error.message : "UNKNOWN";
    }
    expect(message).toBe("ANALYTICS_PERSONAL_DATA_DETECTED");
  });
});
