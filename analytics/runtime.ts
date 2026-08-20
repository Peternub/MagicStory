import { randomUUID } from "node:crypto";
import { analyzeMetrics, type AnalysisTransport } from "./ai/analyzer";
import { createAnalyticsGatewayTransport } from "./ai/gateway";
import { deriveAlertCandidates, processAlertCycle } from "./alerts/engine";
import { collectProductMetrics } from "./collectors/product";
import {
  collectSystemHealth,
  defaultCheckHttp,
  defaultGetBackupAgeHours,
  defaultGetDiskUsedPercent,
  defaultGetLoadRatio,
  defaultGetMemoryUsedPercent,
  defaultIsServiceActive
} from "./collectors/system";
import type { AnalyticsConfig } from "./config";
import { AnalyticsDatabase } from "./database";
import { buildAnalyticsPeriods, getReportDate } from "./periods";
import { renderDailyReport, renderStatus } from "./reports/telegram";
import { evaluateRules } from "./rules/engine";
import { TelegramClient } from "./telegram/client";
import { TelegramCommandRouter } from "./telegram/commands";

type Runtime = {
  config: AnalyticsConfig;
  database: AnalyticsDatabase;
  telegram: TelegramClient;
  analysisTransport: AnalysisTransport | null;
};

function log(event: string, details: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), event, ...details }));
}

export function createRuntime(config: AnalyticsConfig): Runtime {
  const database = new AnalyticsDatabase(config.databaseUrl);
  const analysisTransport = config.aiEnabled
    ? createAnalyticsGatewayTransport({
      baseUrl: config.aiGatewayUrl!,
      sharedSecret: config.gatewaySharedSecret!,
      model: config.aiModel,
      caFile: config.aiGatewayCaFile
    })
    : null;
  return {
    config,
    database,
    telegram: new TelegramClient(config.telegramBotToken),
    analysisTransport
  };
}

async function collectBase(runtime: Runtime, reportAt: Date) {
  const { config, database } = runtime;
  const periods = buildAnalyticsPeriods(reportAt, config.timezone, config.baselineDays);
  const gatewayHealthUrl = config.aiGatewayHealthUrl
    || (config.aiGatewayUrl ? new URL("/health", config.aiGatewayUrl).toString() : undefined);
  const [metrics, health] = await Promise.all([
    collectProductMetrics(database.query, periods, config.minimumRetentionSample),
    collectSystemHealth({
      backendHealthUrl: config.backendHealthUrl,
      aiGatewayHealthUrl: gatewayHealthUrl,
      backupDirectory: config.backupDirectory,
      diskPath: config.diskPath,
      productionService: config.productionService,
      nginxService: config.nginxService,
      aiGatewayService: config.aiGatewayService,
      thresholds: config.systemThresholds
    }, {
      checkHttp: defaultCheckHttp,
      query: database.query,
      getBackupAgeHours: defaultGetBackupAgeHours,
      getDiskUsedPercent: defaultGetDiskUsedPercent,
      getMemoryUsedPercent: defaultGetMemoryUsedPercent,
      getLoadRatio: defaultGetLoadRatio,
      isServiceActive: defaultIsServiceActive,
      now: () => new Date()
    })
  ]);
  return { metrics, health };
}

export async function generateToday(runtime: Runtime, reportAt = new Date()) {
  const collected = await collectBase(runtime, reportAt);
  const rules = evaluateRules(collected.metrics, collected.health, runtime.config.ruleConfig);
  const ai = runtime.analysisTransport
    ? await analyzeMetrics(collected.metrics, rules, runtime.analysisTransport, collected.health)
    : null;
  return {
    ...collected,
    rules,
    ai,
    text: renderDailyReport({ ...collected, rules, ai })
  };
}

async function sendToReportChats(runtime: Runtime, text: string) {
  for (const chatId of runtime.config.reportChatIds) {
    await runtime.telegram.sendMessage(chatId, text);
  }
}

export async function runDailyReport(runtime: Runtime, reportAt = new Date()) {
  const startedAt = Date.now();
  const reportId = randomUUID();
  log("daily_report_started", { reportId });
  const report = await generateToday(runtime, reportAt);
  let delivery = "failed";
  try {
    await sendToReportChats(runtime, report.text);
    delivery = "sent";
  } finally {
    await runtime.database.saveSnapshot({
      reportDate: getReportDate(reportAt, runtime.config.timezone),
      metrics: report.metrics,
      health: report.health,
      rules: report.rules,
      ai: report.ai,
      metadata: {
        reportId,
        trigger: "scheduled",
        telegramDelivery: delivery,
        aiAnalysis: report.ai ? "available" : "unavailable",
        executionTimeMs: Date.now() - startedAt
      }
    });
  }
  log("daily_report_completed", {
    reportId,
    delivery,
    aiAnalysis: report.ai ? "available" : "unavailable",
    executionTimeMs: Date.now() - startedAt
  });
}

export async function getStatus(runtime: Runtime) {
  const { health } = await collectBase(runtime, new Date());
  return renderStatus(health);
}

export async function runAlerts(runtime: Runtime, now = new Date()) {
  const { metrics, health } = await collectBase(runtime, now);
  const states = await runtime.database.getAlertStates();
  const cycle = processAlertCycle({
    candidates: deriveAlertCandidates(metrics, health),
    states,
    now,
    cooldownMinutes: runtime.config.alertCooldownMinutes
  });
  for (const message of cycle.messages) {
    await sendToReportChats(runtime, message);
  }
  await runtime.database.saveAlertStates(cycle.mutations);
  log("alert_check_completed", {
    activeAlerts: cycle.mutations.filter((item) => item.status === "open").length,
    messagesSent: cycle.messages.length
  });
}

export async function runBot(runtime: Runtime) {
  let offset: number | undefined;
  const router = new TelegramCommandRouter({
    allowedChatIds: new Set(runtime.config.allowedChatIds),
    sendMessage: (chatId, text) => runtime.telegram.sendMessage(chatId, text),
    generateToday: async () => (await generateToday(runtime)).text,
    getStatus: () => getStatus(runtime),
    now: () => Date.now()
  });
  log("telegram_bot_started");
  while (true) {
    try {
      const updates = await runtime.telegram.getUpdates(offset);
      for (const update of updates) {
        offset = Math.max(offset ?? 0, update.update_id + 1);
        try {
          await router.handle(update);
        } catch (error) {
          log("telegram_command_failed", {
            message: error instanceof Error ? error.message : "UNKNOWN"
          });
        }
      }
    } catch (error) {
      log("telegram_poll_failed", {
        message: error instanceof Error ? error.message : "UNKNOWN"
      });
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }
}
