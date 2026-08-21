import { describe, expect, test } from "bun:test";
import { buildAnalyticsPeriods } from "../periods";
import { collectProductMetrics, type QueryExecutor } from "./product";

const periods = buildAnalyticsPeriods(new Date("2026-08-20T07:00:00Z"), "Europe/Moscow");

function fakeQuery(failMarker?: string): QueryExecutor {
  return async <Row>(sql: string) => {
    if (failMarker && sql.includes(failMarker)) throw new Error("TEST_QUERY_FAILED");
    if (sql.includes("analytics:users")) {
      return { rows: [{
        new_current: 15, new_previous: 10, new_baseline: 12,
        active_current: 20, active_previous: 16, active_baseline: 14,
        returned_current: 8
      } as Row] };
    }
    if (sql.includes("analytics:content")) {
      return { rows: [{
        children_current: 5, children_previous: 4, children_baseline: 3,
        series_current: 9, series_previous: 7, series_baseline: 6,
        episodes_current: 30, episodes_previous: 20, episodes_baseline: 18,
        success_current: 28, success_previous: 19, success_baseline: 17,
        failed_current: 2, failed_previous: 1, failed_baseline: 1,
        first_series_users: 6, continuing_users: 11
      } as Row] };
    }
    if (sql.includes("analytics:retention")) {
      return { rows: [{ episode_one_users: 20, episode_two_users: 12 } as Row] };
    }
    if (sql.includes("analytics:ai-models")) {
      return { rows: [{ provider: "openai", model: "gpt-test", requests: 30 } as Row] };
    }
    if (sql.includes("analytics:ai-errors")) {
      return { rows: [{ error_category: "timeout", count: 2 } as Row] };
    }
    return { rows: [{
      requests_current: 30, requests_previous: 20, requests_baseline: 18,
      success_current: 28, success_previous: 19, success_baseline: 17,
      failed_current: 2, failed_previous: 1, failed_baseline: 1,
      avg_latency_ms: 14000, p95_latency_ms: 24000,
      input_tokens: 1000, output_tokens: 3000, estimated_cost_usd: "1.250000"
    } as Row] };
  };
}

describe("сбор продуктовых метрик", () => {
  test("возвращает единый обезличенный объект", async () => {
    const metrics = await collectProductMetrics(fakeQuery(), periods);

    expect(metrics.users.new.changeVsPreviousPercent).toBe(50);
    expect(metrics.users.nextDayReturn.value).toBe(50);
    expect(metrics.content.episodesPerActiveUser).toBe(1.4);
    expect(metrics.content.episodeContinuationRate.value).toBe(60);
    expect(metrics.ai.errorRate).toBe(6.67);
    expect(metrics.ai.estimatedCostUsd).toBe(1.25);
    expect(metrics.ai.errorCategories).toEqual([{ category: "timeout", count: 2 }]);
    expect(JSON.stringify(metrics)).not.toContain("email");
  });

  test("не отменяет отчёт при отказе дополнительной AI-метрики", async () => {
    const metrics = await collectProductMetrics(fakeQuery("analytics:ai-models"), periods);

    expect(metrics.users.new.current).toBe(15);
    expect(metrics.ai.models).toEqual([]);
    expect(metrics.collectionWarnings).toContain("ai_model_metrics_unavailable");
  });

  test("помечает секцию недоступной при ошибке SQL", async () => {
    const metrics = await collectProductMetrics(fakeQuery("analytics:content"), periods);

    expect(metrics.content.availability).toBe("unavailable");
    expect(metrics.users.active.current).toBe(20);
    expect(metrics.collectionWarnings).toContain("content_metrics_unavailable");
  });

  test("делит базовые агрегаты на скалярное число дней", async () => {
    const queries: string[] = [];
    const query = fakeQuery();

    await collectProductMetrics(async <Row>(sql: string, values: unknown[]) => {
      queries.push(sql);
      return query<Row>(sql, values);
    }, periods);

    const usersSql = queries.find((sql) => sql.includes("analytics:users")) ?? "";
    const aiSql = queries.find((sql) => sql.includes("analytics:ai */")) ?? "";
    expect(/\/ baseline_days/.test(usersSql)).toBe(false);
    expect(/\/ baseline_days/.test(aiSql)).toBe(false);
    expect(usersSql).toContain("/ (select baseline_days from bounds)");
    expect(aiSql.match(/\/ \(select baseline_days from bounds\)/g)?.length).toBe(3);
  });
});
