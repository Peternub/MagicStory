import { createHash } from "node:crypto";
import type { NormalizedMetrics, SystemHealth } from "../types";

export type AlertCandidate = {
  code: string;
  severity: "warning" | "critical";
  message: string;
  minimumOccurrences: number;
};

export type AlertState = {
  code: string;
  severity: "warning" | "critical";
  status: "open" | "resolved";
  fingerprint: string;
  firstDetectedAt: string;
  lastDetectedAt: string;
  lastAlertedAt: string | null;
  resolvedAt: string | null;
  occurrences: number;
};

export type AlertMutation = AlertState;

export type AlertCycleResult = {
  messages: string[];
  mutations: AlertMutation[];
};

function fingerprint(candidate: AlertCandidate) {
  return createHash("sha256")
    .update(`${candidate.code}:${candidate.severity}`)
    .digest("hex");
}

export function deriveAlertCandidates(metrics: NormalizedMetrics, health: SystemHealth) {
  const candidates: AlertCandidate[] = [];
  const addHealth = (
    code: string,
    message: string,
    state: SystemHealth[keyof Omit<SystemHealth, "checkedAt">],
    minimumOccurrences = 1
  ) => {
    if (state.state === "critical") {
      candidates.push({ code, severity: "critical", message: state.message || message, minimumOccurrences });
    }
  };

  addHealth("BACKEND_DOWN", "Backend недоступен.", health.backend, 2);
  addHealth("DATABASE_DOWN", "PostgreSQL недоступен.", health.database, 2);
  addHealth("BACKUP_EXPIRED", "Резервная копия просрочена.", health.backup);
  addHealth("DISK_CRITICAL", "Диск заполнен до критического уровня.", health.disk);
  addHealth("PRODUCTION_SERVICE_DOWN", "Production service остановлен.", health.productionService, 2);
  addHealth("AI_GATEWAY_DOWN", "AI Gateway недоступен.", health.aiGateway, 2);

  const requests = metrics.ai.requests.current ?? 0;
  if (requests >= 10 && metrics.ai.errorRate !== null && metrics.ai.errorRate > 10) {
    candidates.push({
      code: "AI_ERROR_RATE_CRITICAL",
      severity: "critical",
      message: `AI error rate ${metrics.ai.errorRate}% при ${requests} запросах.`,
      minimumOccurrences: 1
    });
  }
  return candidates;
}

export function processAlertCycle(input: {
  candidates: AlertCandidate[];
  states: AlertState[];
  now: Date;
  cooldownMinutes: number;
}): AlertCycleResult {
  const nowIso = input.now.toISOString();
  const current = new Map(input.candidates.map((item) => [item.code, item]));
  const existing = new Map(input.states.map((item) => [item.code, item]));
  const messages: string[] = [];
  const mutations: AlertMutation[] = [];

  for (const candidate of input.candidates) {
    const old = existing.get(candidate.code);
    const sameIncident = old?.status === "open" && old.fingerprint === fingerprint(candidate);
    const occurrences = sameIncident ? old.occurrences + 1 : 1;
    const firstDetectedAt = sameIncident ? old.firstDetectedAt : nowIso;
    let lastAlertedAt = sameIncident ? old.lastAlertedAt : null;
    const cooldownPassed = !lastAlertedAt
      || input.now.getTime() - new Date(lastAlertedAt).getTime() >= input.cooldownMinutes * 60_000;

    if (occurrences >= candidate.minimumOccurrences && cooldownPassed) {
      messages.push(`🚨 ${candidate.code}\n${candidate.message}`);
      lastAlertedAt = nowIso;
    }

    mutations.push({
      code: candidate.code,
      severity: candidate.severity,
      status: "open",
      fingerprint: fingerprint(candidate),
      firstDetectedAt,
      lastDetectedAt: nowIso,
      lastAlertedAt,
      resolvedAt: null,
      occurrences
    });
  }

  for (const old of input.states) {
    if (old.status !== "open" || current.has(old.code)) continue;
    if (old.lastAlertedAt) {
      const durationMinutes = Math.max(1, Math.round(
        (input.now.getTime() - new Date(old.firstDetectedAt).getTime()) / 60_000
      ));
      messages.push(`✅ ${old.code}: система снова доступна.\nНедоступность: ${durationMinutes} мин.`);
    }
    mutations.push({ ...old, status: "resolved", resolvedAt: nowIso, lastDetectedAt: nowIso });
  }

  return { messages, mutations };
}
