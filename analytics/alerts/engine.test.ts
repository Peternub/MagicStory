import { describe, expect, test } from "bun:test";
import { processAlertCycle, type AlertCandidate, type AlertState } from "./engine";

const candidate: AlertCandidate = {
  code: "BACKEND_DOWN",
  severity: "critical",
  message: "Backend недоступен.",
  minimumOccurrences: 2
};

describe("alert cooldown и recovery", () => {
  test("ждёт стабильного повторного отказа", () => {
    const first = processAlertCycle({
      candidates: [candidate], states: [],
      now: new Date("2026-08-20T10:00:00Z"), cooldownMinutes: 360
    });
    expect(first.messages).toEqual([]);
    const second = processAlertCycle({
      candidates: [candidate], states: first.mutations,
      now: new Date("2026-08-20T10:05:00Z"), cooldownMinutes: 360
    });
    expect(second.messages[0]).toContain("BACKEND_DOWN");
  });

  test("не повторяет alert до истечения cooldown", () => {
    const first = processAlertCycle({
      candidates: [candidate], states: [],
      now: new Date("2026-08-20T10:00:00Z"), cooldownMinutes: 360
    });
    const second = processAlertCycle({
      candidates: [candidate], states: first.mutations,
      now: new Date("2026-08-20T10:05:00Z"), cooldownMinutes: 360
    });
    const result = processAlertCycle({
      candidates: [candidate], states: second.mutations,
      now: new Date("2026-08-20T10:10:00Z"), cooldownMinutes: 360
    });
    expect(result.messages).toEqual([]);
  });

  test("отправляет recovery только для ранее отправленного alert", () => {
    const state: AlertState = {
      code: "DATABASE_DOWN", severity: "critical", status: "open",
      fingerprint: "hash", firstDetectedAt: "2026-08-20T10:00:00Z",
      lastDetectedAt: "2026-08-20T10:05:00Z", lastAlertedAt: "2026-08-20T10:05:00Z",
      resolvedAt: null, occurrences: 2
    };
    const result = processAlertCycle({
      candidates: [], states: [state],
      now: new Date("2026-08-20T10:17:00Z"), cooldownMinutes: 360
    });
    expect(result.messages[0]).toContain("17 мин");
    expect(result.mutations[0]?.status).toBe("resolved");
  });
});
