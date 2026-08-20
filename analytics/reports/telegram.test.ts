import { describe, expect, test } from "bun:test";
import { collectProductMetrics, type QueryExecutor } from "../collectors/product";
import { buildAnalyticsPeriods } from "../periods";
import { evaluateRules } from "../rules/engine";
import { renderDailyReport } from "./telegram";

const query: QueryExecutor = async <Row>(sql: string) => {
  if (sql.includes("analytics:users")) return { rows: [{
    new_current: 14, new_previous: 9, new_baseline: 8.4,
    active_current: 37, active_previous: 30, active_baseline: 28, returned_current: 18
  } as Row] };
  if (sql.includes("analytics:content")) return { rows: [{
    children_current: 5, children_previous: 4, children_baseline: 3,
    series_current: 12, series_previous: 9, series_baseline: 8,
    episodes_current: 61, episodes_previous: 40, episodes_baseline: 35,
    success_current: 61, success_previous: 39, success_baseline: 34,
    failed_current: 4, failed_previous: 1, failed_baseline: 1,
    first_series_users: 8, continuing_users: 23
  } as Row] };
  if (sql.includes("analytics:retention")) return { rows: [{ episode_one_users: 20, episode_two_users: 12 } as Row] };
  if (sql.includes("analytics:ai-models")) return { rows: [] };
  return { rows: [{
    requests_current: 65, requests_previous: 40, requests_baseline: 35,
    success_current: 61, success_previous: 39, success_baseline: 34,
    failed_current: 4, failed_previous: 1, failed_baseline: 1,
    avg_latency_ms: 14300, p95_latency_ms: 25000,
    input_tokens: 100, output_tokens: 200, estimated_cost_usd: 3.48
  } as Row] };
};

describe("Telegram-отчёт", () => {
  test("формирует короткий отчёт без AI", async () => {
    const metrics = await collectProductMetrics(
      query,
      buildAnalyticsPeriods(new Date("2026-08-20T07:00:00Z"), "Europe/Moscow")
    );
    const report = renderDailyReport({ metrics, rules: evaluateRules(metrics), ai: null });
    expect(report).toContain("SkazKIDS — отчёт за 20 августа");
    expect(report).toContain("Ошибки: 4 (6.15%)");
    expect(report).toContain("Что сделать сегодня");
    expect(report.length < 4097).toBe(true);
  });
});
