import { execFile } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import { cpus, freemem, loadavg, totalmem } from "node:os";
import { promisify } from "node:util";
import type { HealthComponent, SystemHealth } from "../types";
import type { QueryExecutor } from "./product";

const execFileAsync = promisify(execFile);

export type SystemThresholds = {
  backupWarningHours: number;
  backupCriticalHours: number;
  diskWarningPercent: number;
  diskCriticalPercent: number;
  memoryWarningPercent: number;
  memoryCriticalPercent: number;
  loadWarningRatio: number;
  loadCriticalRatio: number;
};

export const defaultSystemThresholds: SystemThresholds = {
  backupWarningHours: 30,
  backupCriticalHours: 48,
  diskWarningPercent: 75,
  diskCriticalPercent: 90,
  memoryWarningPercent: 85,
  memoryCriticalPercent: 95,
  loadWarningRatio: 1,
  loadCriticalRatio: 2
};

export type SystemCollectorConfig = {
  backendHealthUrl: string;
  aiGatewayHealthUrl?: string;
  backupDirectory: string;
  diskPath: string;
  productionService: string;
  nginxService: string;
  aiGatewayService?: string;
  thresholds?: SystemThresholds;
};

export type SystemCollectorDependencies = {
  checkHttp(url: string): Promise<boolean>;
  query: QueryExecutor;
  getBackupAgeHours(directory: string): Promise<number>;
  getDiskUsedPercent(path: string): Promise<number>;
  getMemoryUsedPercent(): number;
  getLoadRatio(): number;
  isServiceActive(name: string): Promise<boolean>;
  now(): Date;
};

function measuredState(
  value: number,
  warning: number,
  critical: number,
  unit: string,
  label: string
): HealthComponent {
  if (!Number.isFinite(value)) {
    return { state: "critical", message: `${label}: значение недоступно.` };
  }
  const rounded = Math.round(value * 10) / 10;
  if (value >= critical) {
    return { state: "critical", value: rounded, unit, message: `${label}: критическое значение ${rounded}${unit}.` };
  }
  if (value >= warning) {
    return { state: "warning", value: rounded, unit, message: `${label}: предупреждение ${rounded}${unit}.` };
  }
  return { state: "ok", value: rounded, unit };
}

function booleanState(ok: boolean, failureMessage: string): HealthComponent {
  return ok ? { state: "ok" } : { state: "critical", message: failureMessage };
}

function settledBoolean(
  result: PromiseSettledResult<boolean>,
  failureMessage: string
): HealthComponent {
  return result.status === "fulfilled"
    ? booleanState(result.value, failureMessage)
    : { state: "critical", message: failureMessage };
}

export async function collectSystemHealth(
  config: SystemCollectorConfig,
  dependencies: SystemCollectorDependencies
): Promise<SystemHealth> {
  const thresholds = config.thresholds ?? defaultSystemThresholds;
  const [backend, database, backup, disk, productionService, nginx, aiGatewayHttp, aiGatewayService] = await Promise.allSettled([
    dependencies.checkHttp(config.backendHealthUrl),
    dependencies.query<{ ok: number }>("/* analytics:database-health */ select 1 as ok", []).then((result) => result.rows[0]?.ok === 1),
    dependencies.getBackupAgeHours(config.backupDirectory),
    dependencies.getDiskUsedPercent(config.diskPath),
    dependencies.isServiceActive(config.productionService),
    dependencies.isServiceActive(config.nginxService),
    config.aiGatewayHealthUrl ? dependencies.checkHttp(config.aiGatewayHealthUrl) : Promise.resolve(true),
    config.aiGatewayService ? dependencies.isServiceActive(config.aiGatewayService) : Promise.resolve(true)
  ]);

  const backupComponent = backup.status === "fulfilled"
    ? measuredState(backup.value, thresholds.backupWarningHours, thresholds.backupCriticalHours, " ч", "Возраст backup")
    : { state: "critical" as const, message: "Не удалось найти валидную резервную копию." };
  const diskComponent = disk.status === "fulfilled"
    ? measuredState(disk.value, thresholds.diskWarningPercent, thresholds.diskCriticalPercent, "%", "Заполнение диска")
    : { state: "unavailable" as const, message: "Не удалось получить состояние диска." };
  const memoryValue = dependencies.getMemoryUsedPercent();
  const loadValue = dependencies.getLoadRatio();
  const aiConfigured = Boolean(config.aiGatewayHealthUrl || config.aiGatewayService);
  const aiOk = aiGatewayHttp.status === "fulfilled" && aiGatewayHttp.value
    && aiGatewayService.status === "fulfilled" && aiGatewayService.value;

  return {
    backend: settledBoolean(backend, "Backend health-check не прошёл."),
    database: settledBoolean(database, "PostgreSQL не отвечает на select 1."),
    backup: backupComponent,
    disk: diskComponent,
    memory: measuredState(memoryValue, thresholds.memoryWarningPercent, thresholds.memoryCriticalPercent, "%", "Использование RAM"),
    load: measuredState(loadValue, thresholds.loadWarningRatio, thresholds.loadCriticalRatio, "x", "Load average на CPU"),
    productionService: settledBoolean(productionService, `Сервис ${config.productionService} не активен.`),
    nginx: settledBoolean(nginx, `Сервис ${config.nginxService} не активен.`),
    aiGateway: aiConfigured
      ? booleanState(aiOk, "AI Gateway недоступен.")
      : { state: "unavailable", message: "AI Gateway не настроен для проверки." },
    checkedAt: dependencies.now().toISOString()
  };
}

export async function defaultCheckHttp(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
  return response.ok;
}

export async function defaultGetBackupAgeHours(directory: string) {
  const entries = await readdir(directory);
  const candidates = entries.filter((name) => /^skazkids-.*\.dump$/.test(name));
  if (candidates.length === 0) return Number.POSITIVE_INFINITY;
  const timestamps = await Promise.all(candidates.map(async (name) => (
    await stat(`${directory}/${name}`)
  ).mtimeMs));
  return (Date.now() - Math.max(...timestamps)) / 3_600_000;
}

export async function defaultGetDiskUsedPercent(path: string) {
  const { stdout } = await execFileAsync("df", ["-P", path]);
  const line = stdout.trim().split(/\r?\n/).at(-1) ?? "";
  const match = line.match(/\s(\d+)%\s/);
  if (!match) throw new Error("ANALYTICS_DISK_PARSE_FAILED");
  return Number(match[1]);
}

export function defaultGetMemoryUsedPercent() {
  return ((totalmem() - freemem()) / totalmem()) * 100;
}

export function defaultGetLoadRatio() {
  return loadavg()[0] / Math.max(1, cpus().length);
}

export async function defaultIsServiceActive(name: string) {
  try {
    const { stdout } = await execFileAsync("systemctl", ["is-active", name]);
    return stdout.trim() === "active";
  } catch {
    return false;
  }
}
