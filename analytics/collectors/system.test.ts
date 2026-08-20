import { describe, expect, test } from "bun:test";
import { collectSystemHealth, type SystemCollectorDependencies } from "./system";

function dependencies(overrides: Partial<SystemCollectorDependencies> = {}): SystemCollectorDependencies {
  return {
    checkHttp: async () => true,
    query: async <Row>() => ({ rows: [{ ok: 1 } as Row] }),
    getBackupAgeHours: async () => 12,
    getDiskUsedPercent: async () => 43,
    getMemoryUsedPercent: () => 50,
    getLoadRatio: () => 0.4,
    isServiceActive: async () => true,
    now: () => new Date("2026-08-20T07:00:00Z"),
    ...overrides
  };
}

const config = {
  backendHealthUrl: "http://127.0.0.1:3000/api/health",
  aiGatewayHealthUrl: "http://127.0.0.1:3100/health",
  backupDirectory: "/var/backups/skazkids/postgresql",
  diskPath: "/opt/skazkids",
  productionService: "skazkids.service",
  nginxService: "nginx.service",
  aiGatewayService: "skazkids-ai-gateway.service"
};

describe("системные health checks", () => {
  test("нормализует исправную систему", async () => {
    const health = await collectSystemHealth(config, dependencies());
    expect(health.backend.state).toBe("ok");
    expect(health.backup.value).toBe(12);
    expect(health.disk.state).toBe("ok");
  });

  test("применяет пороги backup и disk", async () => {
    const health = await collectSystemHealth(config, dependencies({
      getBackupAgeHours: async () => 35,
      getDiskUsedPercent: async () => 92
    }));
    expect(health.backup.state).toBe("warning");
    expect(health.disk.state).toBe("critical");
  });

  test("не отменяет остальные проверки при отказе одной", async () => {
    const health = await collectSystemHealth(config, dependencies({
      query: async () => { throw new Error("DB_DOWN"); }
    }));
    expect(health.database.state).toBe("critical");
    expect(health.backend.state).toBe("ok");
  });
});
