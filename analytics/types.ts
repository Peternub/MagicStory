export type Availability = "available" | "insufficient_data" | "unavailable";

export type ComparisonMetric = {
  current: number | null;
  previous: number | null;
  baseline: number | null;
  changeVsPreviousPercent: number | null;
  changeVsBaselinePercent: number | null;
  availability: Availability;
};

export type RateMetric = {
  value: number | null;
  numerator: number;
  denominator: number;
  availability: Availability;
};

export type AnalyticsPeriods = {
  timezone: string;
  current: { from: string; to: string };
  previous: { from: string; to: string };
  baseline: { from: string; to: string; days: number };
};

export type NormalizedMetrics = {
  period: AnalyticsPeriods;
  users: {
    new: ComparisonMetric;
    active: ComparisonMetric;
    nextDayReturn: RateMetric;
  };
  content: {
    childProfilesCreated: ComparisonMetric;
    seriesCreated: ComparisonMetric;
    episodesCreated: ComparisonMetric;
    successfulGenerations: ComparisonMetric;
    failedGenerations: ComparisonMetric;
    firstSeriesUsers: number | null;
    continuingSeriesUsers: number | null;
    episodesPerActiveUser: number | null;
    episodeContinuationRate: RateMetric;
    availability: Availability;
  };
  ai: {
    requests: ComparisonMetric;
    successful: ComparisonMetric;
    failed: ComparisonMetric;
    errorRate: number | null;
    avgLatencyMs: number | null;
    p95LatencyMs: number | null;
    inputTokens: number | null;
    outputTokens: number | null;
    estimatedCostUsd: number | null;
    models: Array<{ provider: string; model: string; requests: number }>;
    errorCategories: Array<{ category: string; count: number }>;
    availability: Availability;
  };
  collectionWarnings: string[];
};

export type HealthState = "ok" | "warning" | "critical" | "unavailable";

export type HealthComponent = {
  state: HealthState;
  value?: number;
  unit?: string;
  message?: string;
};

export type SystemHealth = {
  backend: HealthComponent;
  database: HealthComponent;
  backup: HealthComponent;
  disk: HealthComponent;
  memory: HealthComponent;
  load: HealthComponent;
  productionService: HealthComponent;
  nginx: HealthComponent;
  aiGateway: HealthComponent;
  checkedAt: string;
};

export type RuleProblem = {
  code: string;
  severity: "warning" | "critical";
  title: string;
  explanation: string;
};

export type RuleAction = {
  priority: number;
  action: string;
  reason: string;
};

export type RuleResults = {
  positiveSignals: string[];
  problems: RuleProblem[];
  actions: RuleAction[];
};

export type AiAnalysis = {
  summary: string;
  positiveSignals: string[];
  problems: Array<{
    severity: "warning" | "critical";
    title: string;
    explanation: string;
  }>;
  actions: RuleAction[];
};
