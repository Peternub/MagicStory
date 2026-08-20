import type { AnalyticsPeriods } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function assertTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("ru-RU", { timeZone: timezone }).format(new Date());
  } catch {
    throw new Error("ANALYTICS_INVALID_TIMEZONE");
  }
}

export function buildAnalyticsPeriods(
  reportAt: Date,
  timezone: string,
  baselineDays = 7
): AnalyticsPeriods {
  assertTimezone(timezone);
  if (!Number.isSafeInteger(baselineDays) || baselineDays < 1 || baselineDays > 31) {
    throw new Error("ANALYTICS_INVALID_BASELINE_DAYS");
  }
  if (Number.isNaN(reportAt.getTime())) {
    throw new Error("ANALYTICS_INVALID_REPORT_TIME");
  }

  const currentTo = reportAt.getTime();
  const currentFrom = currentTo - DAY_MS;
  const previousFrom = currentFrom - DAY_MS;
  const baselineTo = previousFrom;
  const baselineFrom = baselineTo - baselineDays * DAY_MS;

  return {
    timezone,
    current: {
      from: new Date(currentFrom).toISOString(),
      to: new Date(currentTo).toISOString()
    },
    previous: {
      from: new Date(previousFrom).toISOString(),
      to: new Date(currentFrom).toISOString()
    },
    baseline: {
      from: new Date(baselineFrom).toISOString(),
      to: new Date(baselineTo).toISOString(),
      days: baselineDays
    }
  };
}

export function getReportDate(reportAt: Date, timezone: string) {
  assertTimezone(timezone);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(reportAt);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
