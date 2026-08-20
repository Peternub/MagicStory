import type {
  AiAnalysis,
  ComparisonMetric,
  HealthComponent,
  NormalizedMetrics,
  RuleResults,
  SystemHealth
} from "../types";

function metricValue(metric: ComparisonMetric) {
  return metric.current === null ? "н/д" : String(metric.current);
}

function baselineValue(metric: ComparisonMetric) {
  return metric.baseline === null ? "н/д" : String(metric.baseline);
}

function changeValue(metric: ComparisonMetric) {
  if (metric.changeVsBaselinePercent === null) return "н/д";
  const sign = metric.changeVsBaselinePercent > 0 ? "+" : "";
  return `${sign}${metric.changeVsBaselinePercent}%`;
}

function healthIcon(component: HealthComponent) {
  if (component.state === "ok") return "🟢";
  if (component.state === "warning") return "🟡";
  if (component.state === "critical") return "🔴";
  return "⚪";
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function reportDate(metrics: NormalizedMetrics) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: metrics.period.timezone,
    day: "numeric",
    month: "long"
  }).format(new Date(metrics.period.current.to));
}

export function renderStatus(health: SystemHealth) {
  return [
    `Backend ${healthIcon(health.backend)}`,
    `Database ${healthIcon(health.database)}`,
    `AI ${healthIcon(health.aiGateway)}`,
    `Backup ${healthIcon(health.backup)}`,
    `Disk ${healthIcon(health.disk)}`
  ].join("\n");
}

export function renderDailyReport(input: {
  metrics: NormalizedMetrics;
  rules: RuleResults;
  health?: SystemHealth;
  ai?: AiAnalysis | null;
}) {
  const { metrics, rules, health, ai } = input;
  const positives = unique([...rules.positiveSignals, ...(ai?.positiveSignals ?? [])]).slice(0, 4);
  const problems = [
    ...rules.problems.map((item) => `${item.severity === "critical" ? "🔴" : "•"} ${item.title}: ${item.explanation}`),
    ...(ai?.problems ?? []).map((item) => `• ${item.title}: ${item.explanation}`)
  ].slice(0, 5);
  const actions = Array.from(new Map(
    [...rules.actions, ...(ai?.actions ?? [])].map((item) => [item.action, item])
  ).values()).slice(0, 3);

  const lines = [
    `📊 SkazKIDS — отчёт за ${reportDate(metrics)}`,
    ai?.summary ? `\n${ai.summary}` : "",
    "\n👥 Пользователи",
    `Новые: ${metricValue(metrics.users.new)}`,
    `Вчера: ${metrics.users.new.previous ?? "н/д"}`,
    `7-дневное среднее: ${baselineValue(metrics.users.new)}`,
    `Изменение: ${changeValue(metrics.users.new)}`,
    `Активные: ${metricValue(metrics.users.active)}`,
    `Вернулись: ${metrics.users.nextDayReturn.value === null ? "недостаточно данных" : `${metrics.users.nextDayReturn.value}%`}`,
    "\n📚 Контент",
    `Профили детей: ${metricValue(metrics.content.childProfilesCreated)}`,
    `Создано сериалов: ${metricValue(metrics.content.seriesCreated)}`,
    `Создано эпизодов: ${metricValue(metrics.content.episodesCreated)}`,
    `Успешных генераций: ${metricValue(metrics.content.successfulGenerations)}`,
    `Продолжили сериал: ${metrics.content.continuingSeriesUsers ?? "н/д"}`,
    "\n🤖 AI",
    `Запросов: ${metricValue(metrics.ai.requests)}`,
    `Успешно: ${metricValue(metrics.ai.successful)}`,
    `Ошибки: ${metricValue(metrics.ai.failed)} (${metrics.ai.errorRate === null ? "н/д" : `${metrics.ai.errorRate}%`})`,
    `Среднее время: ${metrics.ai.avgLatencyMs === null ? "н/д" : `${(metrics.ai.avgLatencyMs / 1000).toFixed(1)} сек`}`,
    `p95: ${metrics.ai.p95LatencyMs === null ? "н/д" : `${(metrics.ai.p95LatencyMs / 1000).toFixed(1)} сек`}`,
    `Расход: ${metrics.ai.estimatedCostUsd === null ? "н/д" : `$${metrics.ai.estimatedCostUsd.toFixed(4)}`}`
  ];

  if (health) {
    lines.push(
      "\n🖥 Система",
      `Backend: ${healthIcon(health.backend)}`,
      `PostgreSQL: ${healthIcon(health.database)}`,
      `Backup: ${healthIcon(health.backup)}${health.backup.value === undefined ? "" : ` ${health.backup.value} ч`}`,
      `Disk: ${healthIcon(health.disk)}${health.disk.value === undefined ? "" : ` ${health.disk.value}%`}`,
      `Nginx: ${healthIcon(health.nginx)}`
    );
  }

  lines.push(
    "\n📈 Что улучшилось",
    ...(positives.length > 0 ? positives.map((item) => `• ${item}`) : ["• Явных положительных сигналов пока недостаточно."]),
    "\n⚠️ На что обратить внимание",
    ...(problems.length > 0 ? problems : ["• Критических отклонений по доступным данным нет."]),
    "\n🎯 Что сделать сегодня",
    ...actions.slice(0, 3).map((item, index) => `${index + 1}. ${item.action}`)
  );

  const result = lines.filter(Boolean).join("\n");
  return result.length <= 4096 ? result : `${result.slice(0, 4080)}\n…`;
}
