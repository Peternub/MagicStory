import { Pool, type QueryResultRow } from "pg";
import type { AlertMutation, AlertState } from "./alerts/engine";
import type { AiAnalysis, NormalizedMetrics, RuleResults, SystemHealth } from "./types";
import type { QueryExecutor } from "./collectors/product";

export class AnalyticsDatabase {
  private readonly pool: Pool;

  readonly query: QueryExecutor;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString, max: 3, idleTimeoutMillis: 10_000 });
    this.query = async <Row>(sql: string, values: unknown[]) => {
      const result = await this.pool.query<QueryResultRow>(sql, values);
      return { rows: result.rows as Row[] };
    };
  }

  async saveSnapshot(input: {
    reportDate: string;
    metrics: NormalizedMetrics;
    health: SystemHealth;
    rules: RuleResults;
    ai: AiAnalysis | null;
    metadata: Record<string, unknown>;
  }) {
    await this.pool.query(
      `
        insert into public.analytics_daily_snapshots (
          report_date, timezone, period_from, period_to, metrics, health,
          rule_results, ai_analysis, estimated_ai_cost_usd, report_metadata
        )
        values ($1::date, $2, $3::timestamptz, $4::timestamptz, $5::jsonb,
          $6::jsonb, $7::jsonb, $8::jsonb, $9::numeric, $10::jsonb)
        on conflict (report_date) do update set
          timezone = excluded.timezone,
          period_from = excluded.period_from,
          period_to = excluded.period_to,
          metrics = excluded.metrics,
          health = excluded.health,
          rule_results = excluded.rule_results,
          ai_analysis = excluded.ai_analysis,
          estimated_ai_cost_usd = excluded.estimated_ai_cost_usd,
          report_metadata = excluded.report_metadata
      `,
      [
        input.reportDate,
        input.metrics.period.timezone,
        input.metrics.period.current.from,
        input.metrics.period.current.to,
        JSON.stringify(input.metrics),
        JSON.stringify(input.health),
        JSON.stringify(input.rules),
        input.ai ? JSON.stringify(input.ai) : null,
        input.metrics.ai.estimatedCostUsd,
        JSON.stringify(input.metadata)
      ]
    );
  }

  async getAlertStates(): Promise<AlertState[]> {
    const result = await this.pool.query<{
      code: string;
      severity: "warning" | "critical";
      status: "open" | "resolved";
      fingerprint: string;
      first_detected_at: Date;
      last_detected_at: Date;
      last_alerted_at: Date | null;
      resolved_at: Date | null;
      details: { occurrences?: number };
    }>(`
      select code, severity, status, fingerprint, first_detected_at,
        last_detected_at, last_alerted_at, resolved_at, details
      from public.analytics_alert_state
    `);
    return result.rows.map((row) => ({
      code: row.code,
      severity: row.severity,
      status: row.status,
      fingerprint: row.fingerprint,
      firstDetectedAt: row.first_detected_at.toISOString(),
      lastDetectedAt: row.last_detected_at.toISOString(),
      lastAlertedAt: row.last_alerted_at?.toISOString() ?? null,
      resolvedAt: row.resolved_at?.toISOString() ?? null,
      occurrences: Number(row.details?.occurrences ?? 0)
    }));
  }

  async saveAlertStates(states: AlertMutation[]) {
    if (states.length === 0) return;
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      for (const state of states) {
        await client.query(
          `
            insert into public.analytics_alert_state (
              code, severity, status, fingerprint, first_detected_at,
              last_detected_at, last_alerted_at, resolved_at, details
            )
            values ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz,
              $7::timestamptz, $8::timestamptz, $9::jsonb)
            on conflict (code) do update set
              severity = excluded.severity,
              status = excluded.status,
              fingerprint = excluded.fingerprint,
              first_detected_at = excluded.first_detected_at,
              last_detected_at = excluded.last_detected_at,
              last_alerted_at = excluded.last_alerted_at,
              resolved_at = excluded.resolved_at,
              details = excluded.details
          `,
          [
            state.code,
            state.severity,
            state.status,
            state.fingerprint,
            state.firstDetectedAt,
            state.lastDetectedAt,
            state.lastAlertedAt,
            state.resolvedAt,
            JSON.stringify({ occurrences: state.occurrences })
          ]
        );
      }
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}
