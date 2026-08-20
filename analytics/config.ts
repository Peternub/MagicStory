import { z } from "zod";

function positiveNumber(fallback: number) {
  return z.preprocess(
    (value) => value === undefined || value === "" ? fallback : Number(value),
    z.number().positive()
  );
}

const configSchema = z.object({
  ANALYTICS_DATABASE_URL: z.string().min(1).refine(
    (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
    "ANALYTICS_DATABASE_URL должна указывать на PostgreSQL"
  ),
  ANALYTICS_TIMEZONE: z.string().min(1).default("Europe/Moscow"),
  ANALYTICS_BASELINE_DAYS: positiveNumber(7),
  ANALYTICS_MIN_RETENTION_SAMPLE: positiveNumber(10),
  ANALYTICS_AI_ENABLED: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
  ANALYTICS_AI_MODEL: z.string().min(1).default("gpt-5.6-terra"),
  AI_GATEWAY_URL: z.string().url().optional(),
  AI_GATEWAY_CA_FILE: z.string().min(1).optional(),
  GATEWAY_SHARED_SECRET: z.string().min(32).optional(),
  TELEGRAM_BOT_TOKEN: z.string().min(20),
  TELEGRAM_ALLOWED_CHAT_IDS: z.string().min(1),
  TELEGRAM_REPORT_CHAT_IDS: z.string().optional(),
  BACKEND_HEALTH_URL: z.string().url().default("http://127.0.0.1:3000/api/health"),
  AI_GATEWAY_HEALTH_URL: z.string().url().optional(),
  ANALYTICS_BACKUP_DIRECTORY: z.string().min(1).default("/var/backups/skazkids/postgresql"),
  ANALYTICS_DISK_PATH: z.string().min(1).default("/opt/skazkids"),
  ANALYTICS_PRODUCTION_SERVICE: z.string().min(1).default("skazkids.service"),
  ANALYTICS_NGINX_SERVICE: z.string().min(1).default("nginx.service"),
  ANALYTICS_AI_GATEWAY_SERVICE: z.string().min(1).optional(),
  ANALYTICS_ALERT_COOLDOWN_MINUTES: positiveNumber(360),
  ANALYTICS_AI_ERROR_WARNING_PERCENT: positiveNumber(5),
  ANALYTICS_AI_ERROR_CRITICAL_PERCENT: positiveNumber(10),
  ANALYTICS_AI_MIN_REQUESTS: positiveNumber(10),
  ANALYTICS_REGISTRATION_CHANGE_PERCENT: positiveNumber(30),
  ANALYTICS_REGISTRATION_MINIMUM: positiveNumber(5),
  ANALYTICS_BACKUP_WARNING_HOURS: positiveNumber(30),
  ANALYTICS_BACKUP_CRITICAL_HOURS: positiveNumber(48),
  ANALYTICS_DISK_WARNING_PERCENT: positiveNumber(75),
  ANALYTICS_DISK_CRITICAL_PERCENT: positiveNumber(90)
});

function parseChatIds(value: string) {
  const ids = value.split(",").map((item) => item.trim()).filter(Boolean);
  if (ids.length === 0 || ids.some((item) => !/^-?\d+$/.test(item))) {
    throw new Error("TELEGRAM_CHAT_IDS_INVALID");
  }
  return Array.from(new Set(ids));
}

export function parseAnalyticsConfig(
  env: Record<string, string | undefined> = process.env
) {
  const parsed = configSchema.parse(env);
  const allowedChatIds = parseChatIds(parsed.TELEGRAM_ALLOWED_CHAT_IDS);
  const reportChatIds = parseChatIds(parsed.TELEGRAM_REPORT_CHAT_IDS || parsed.TELEGRAM_ALLOWED_CHAT_IDS);
  if (reportChatIds.some((id) => !allowedChatIds.includes(id))) {
    throw new Error("TELEGRAM_REPORT_CHAT_NOT_ALLOWED");
  }
  const aiEnabled = parsed.ANALYTICS_AI_ENABLED
    && Boolean(parsed.AI_GATEWAY_URL && parsed.GATEWAY_SHARED_SECRET);

  return {
    databaseUrl: parsed.ANALYTICS_DATABASE_URL,
    timezone: parsed.ANALYTICS_TIMEZONE,
    baselineDays: parsed.ANALYTICS_BASELINE_DAYS,
    minimumRetentionSample: parsed.ANALYTICS_MIN_RETENTION_SAMPLE,
    aiEnabled,
    aiModel: parsed.ANALYTICS_AI_MODEL,
    aiGatewayUrl: parsed.AI_GATEWAY_URL,
    aiGatewayCaFile: parsed.AI_GATEWAY_CA_FILE,
    gatewaySharedSecret: parsed.GATEWAY_SHARED_SECRET,
    telegramBotToken: parsed.TELEGRAM_BOT_TOKEN,
    allowedChatIds,
    reportChatIds,
    backendHealthUrl: parsed.BACKEND_HEALTH_URL,
    aiGatewayHealthUrl: parsed.AI_GATEWAY_HEALTH_URL,
    backupDirectory: parsed.ANALYTICS_BACKUP_DIRECTORY,
    diskPath: parsed.ANALYTICS_DISK_PATH,
    productionService: parsed.ANALYTICS_PRODUCTION_SERVICE,
    nginxService: parsed.ANALYTICS_NGINX_SERVICE,
    aiGatewayService: parsed.ANALYTICS_AI_GATEWAY_SERVICE,
    alertCooldownMinutes: parsed.ANALYTICS_ALERT_COOLDOWN_MINUTES,
    ruleConfig: {
      aiErrorWarningPercent: parsed.ANALYTICS_AI_ERROR_WARNING_PERCENT,
      aiErrorCriticalPercent: parsed.ANALYTICS_AI_ERROR_CRITICAL_PERCENT,
      aiMinimumRequests: parsed.ANALYTICS_AI_MIN_REQUESTS,
      registrationChangePercent: parsed.ANALYTICS_REGISTRATION_CHANGE_PERCENT,
      registrationMinimumCurrent: parsed.ANALYTICS_REGISTRATION_MINIMUM,
      registrationMinimumBaseline: parsed.ANALYTICS_REGISTRATION_MINIMUM
    },
    systemThresholds: {
      backupWarningHours: parsed.ANALYTICS_BACKUP_WARNING_HOURS,
      backupCriticalHours: parsed.ANALYTICS_BACKUP_CRITICAL_HOURS,
      diskWarningPercent: parsed.ANALYTICS_DISK_WARNING_PERCENT,
      diskCriticalPercent: parsed.ANALYTICS_DISK_CRITICAL_PERCENT,
      memoryWarningPercent: 85,
      memoryCriticalPercent: 95,
      loadWarningRatio: 1,
      loadCriticalRatio: 2
    }
  };
}

export type AnalyticsConfig = ReturnType<typeof parseAnalyticsConfig>;
