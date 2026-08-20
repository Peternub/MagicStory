import type {
  HealthComponent,
  NormalizedMetrics,
  RuleAction,
  RuleProblem,
  RuleResults,
  SystemHealth
} from "../types";

export type RuleConfig = {
  aiErrorWarningPercent: number;
  aiErrorCriticalPercent: number;
  aiMinimumRequests: number;
  registrationChangePercent: number;
  registrationMinimumCurrent: number;
  registrationMinimumBaseline: number;
};

export const defaultRuleConfig: RuleConfig = {
  aiErrorWarningPercent: 5,
  aiErrorCriticalPercent: 10,
  aiMinimumRequests: 10,
  registrationChangePercent: 30,
  registrationMinimumCurrent: 5,
  registrationMinimumBaseline: 5
};

function addHealthProblem(
  problems: RuleProblem[],
  actions: RuleAction[],
  code: string,
  title: string,
  component: HealthComponent,
  action: string
) {
  if (component.state !== "warning" && component.state !== "critical") return;
  problems.push({
    code,
    severity: component.state,
    title,
    explanation: component.message || `Компонент имеет состояние ${component.state.toUpperCase()}.`
  });
  actions.push({
    priority: component.state === "critical" ? 1 : 2,
    action,
    reason: title
  });
}

export function evaluateRules(
  metrics: NormalizedMetrics,
  health?: SystemHealth,
  config: RuleConfig = defaultRuleConfig
): RuleResults {
  const positiveSignals: string[] = [];
  const problems: RuleProblem[] = [];
  const actions: RuleAction[] = [];
  const registrations = metrics.users.new;

  if (
    registrations.availability === "available"
    && registrations.current !== null
    && registrations.baseline !== null
    && registrations.current >= config.registrationMinimumCurrent
    && registrations.baseline >= config.registrationMinimumBaseline
    && registrations.changeVsBaselinePercent !== null
  ) {
    if (registrations.changeVsBaselinePercent > config.registrationChangePercent) {
      positiveSignals.push("Регистрации заметно выше 7-дневного среднего при достаточной выборке.");
    } else if (registrations.changeVsBaselinePercent < -config.registrationChangePercent) {
      problems.push({
        code: "REGISTRATIONS_DROP",
        severity: "warning",
        title: "Снижение регистраций",
        explanation: `Регистрации ниже baseline на ${Math.abs(registrations.changeVsBaselinePercent)}%.`
      });
      actions.push({
        priority: 3,
        action: "Проверить источники трафика и воронку регистрации.",
        reason: "Регистрации снизились относительно устойчивого baseline."
      });
    }
  }

  const requests = metrics.ai.requests.current ?? 0;
  const errorRate = metrics.ai.errorRate;
  if (errorRate !== null && requests >= config.aiMinimumRequests) {
    if (errorRate > config.aiErrorCriticalPercent) {
      problems.push({
        code: "AI_ERROR_RATE_CRITICAL",
        severity: "critical",
        title: "Критический уровень ошибок AI",
        explanation: `Ошибки составляют ${errorRate}% при ${requests} запросах.`
      });
      actions.push({
        priority: 1,
        action: "Проверить категории ошибок AI и доступность gateway.",
        reason: "Error rate превысил критический порог."
      });
    } else if (errorRate >= config.aiErrorWarningPercent) {
      problems.push({
        code: "AI_ERROR_RATE_WARNING",
        severity: "warning",
        title: "Повышенный уровень ошибок AI",
        explanation: `Ошибки составляют ${errorRate}% при ${requests} запросах.`
      });
      actions.push({
        priority: 2,
        action: "Посмотреть распределение AI-ошибок по категориям.",
        reason: "Error rate превысил предупреждающий порог."
      });
    }
  }

  if (
    metrics.content.continuingSeriesUsers !== null
    && metrics.content.continuingSeriesUsers > 0
  ) {
    positiveSignals.push("Пользователи продолжали существующие сериалы.");
  }

  if (metrics.collectionWarnings.length > 0) {
    problems.push({
      code: "METRICS_PARTIALLY_UNAVAILABLE",
      severity: "warning",
      title: "Часть метрик недоступна",
      explanation: `Не рассчитано секций: ${metrics.collectionWarnings.length}.`
    });
  }

  if (health) {
    addHealthProblem(problems, actions, "BACKEND_HEALTH", "Backend недоступен", health.backend, "Проверить production service и health endpoint.");
    addHealthProblem(problems, actions, "DATABASE_HEALTH", "PostgreSQL недоступен", health.database, "Проверить PostgreSQL и локальные подключения.");
    addHealthProblem(problems, actions, "BACKUP_HEALTH", "Резервная копия устарела", health.backup, "Проверить backup service и создать валидную копию.");
    addHealthProblem(problems, actions, "DISK_HEALTH", "Высокое заполнение диска", health.disk, "Освободить место и проверить рост файлов.");
    addHealthProblem(problems, actions, "SERVICE_HEALTH", "Production service не работает", health.productionService, "Проверить причины остановки production service.");
    addHealthProblem(problems, actions, "NGINX_HEALTH", "Nginx не работает", health.nginx, "Проверить Nginx и конфигурацию upstream.");
    addHealthProblem(problems, actions, "AI_GATEWAY_HEALTH", "AI Gateway недоступен", health.aiGateway, "Проверить AI Gateway и соединение с провайдером.");
  }

  const uniqueActions = Array.from(
    new Map(actions.map((item) => [item.action, item])).values()
  )
    .sort((left, right) => left.priority - right.priority)
    .slice(0, 3)
    .map((item, index) => ({ ...item, priority: index + 1 }));

  if (uniqueActions.length === 0) {
    uniqueActions.push({
      priority: 1,
      action: "Продолжить наблюдение и не делать выводов без достаточной выборки.",
      reason: "Критических отклонений по доступным данным не найдено."
    });
  }

  return { positiveSignals, problems, actions: uniqueActions };
}
