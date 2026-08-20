import { describe, expect, test } from "bun:test";
import { collectProductMetrics, type QueryExecutor } from "../collectors/product";
import { buildAnalyticsPeriods } from "../periods";
import { evaluateRules } from "./engine";

function queryWithAi(requests: number, failed: number, registrations = 10, baseline = 10): QueryExecutor {
  return async <Row>(sql: string) => {
    if (sql.includes("analytics:users")) return { rows: [{
      new_current: registrations, new_previous: 10, new_baseline: baseline,
      active_current: 3, active_previous: 3, active_baseline: 3, returned_current: 1
    } as Row] };
    if (sql.includes("analytics:content")) return { rows: [{
      children_current: 0, children_previous: 0, children_baseline: 0,
      series_current: 0, series_previous: 0, series_baseline: 0,
      episodes_current: 0, episodes_previous: 0, episodes_baseline: 0,
      success_current: requests - failed, success_previous: 0, success_baseline: 0,
      failed_current: failed, failed_previous: 0, failed_baseline: 0,
      first_series_users: 0, continuing_users: 0
    } as Row] };
    if (sql.includes("analytics:retention")) return { rows: [{ episode_one_users: 0, episode_two_users: 0 } as Row] };
    if (sql.includes("analytics:ai-models")) return { rows: [] };
    return { rows: [{
      requests_current: requests, requests_previous: 0, requests_baseline: 0,
      success_current: requests - failed, success_previous: 0, success_baseline: 0,
      failed_current: failed, failed_previous: 0, failed_baseline: 0,
      avg_latency_ms: 1000, p95_latency_ms: 1000,
      input_tokens: 0, output_tokens: 0, estimated_cost_usd: 0
    } as Row] };
  };
}

const periods = buildAnalyticsPeriods(new Date("2026-08-20T07:00:00Z"), "Europe/Moscow");

describe("Rule Engine", () => {
  test("создаёт critical без участия AI", async () => {
    const metrics = await collectProductMetrics(queryWithAi(20, 3), periods);
    const rules = evaluateRules(metrics);
    expect(rules.problems[0]?.code).toBe("AI_ERROR_RATE_CRITICAL");
    expect(rules.actions[0]?.priority).toBe(1);
  });

  test("не драматизирует проценты на маленькой выборке", async () => {
    const metrics = await collectProductMetrics(queryWithAi(2, 1, 3, 2), periods);
    const rules = evaluateRules(metrics);
    expect(rules.problems.some((item) => item.code === "REGISTRATIONS_DROP")).toBe(false);
    expect(rules.problems.some((item) => item.code.startsWith("AI_ERROR_RATE"))).toBe(false);
  });

  test("выделяет устойчивый рост регистраций", async () => {
    const metrics = await collectProductMetrics(queryWithAi(0, 0, 14, 8), periods);
    const rules = evaluateRules(metrics);
    expect(rules.positiveSignals.join(" ")).toContain("Регистрации");
  });
});
