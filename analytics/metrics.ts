import type { Availability, ComparisonMetric, RateMetric } from "./types";

export function finiteNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function percentChange(current: number, reference: number) {
  if (reference === 0) return null;
  return Math.round(((current - reference) / reference) * 10_000) / 100;
}

export function comparisonMetric(
  current: unknown,
  previous: unknown,
  baseline: unknown,
  availability: Availability = "available"
): ComparisonMetric {
  if (availability !== "available") {
    return {
      current: null,
      previous: null,
      baseline: null,
      changeVsPreviousPercent: null,
      changeVsBaselinePercent: null,
      availability
    };
  }

  const currentValue = finiteNumber(current);
  const previousValue = finiteNumber(previous);
  const baselineValue = Math.round(finiteNumber(baseline) * 100) / 100;
  return {
    current: currentValue,
    previous: previousValue,
    baseline: baselineValue,
    changeVsPreviousPercent: percentChange(currentValue, previousValue),
    changeVsBaselinePercent: percentChange(currentValue, baselineValue),
    availability
  };
}

export function rateMetric(
  numerator: unknown,
  denominator: unknown,
  minimumSample: number
): RateMetric {
  const numeratorValue = finiteNumber(numerator);
  const denominatorValue = finiteNumber(denominator);
  if (denominatorValue < minimumSample) {
    return {
      value: null,
      numerator: numeratorValue,
      denominator: denominatorValue,
      availability: "insufficient_data"
    };
  }

  return {
    value: Math.round((numeratorValue / denominatorValue) * 10_000) / 100,
    numerator: numeratorValue,
    denominator: denominatorValue,
    availability: "available"
  };
}

export function unavailableComparison(): ComparisonMetric {
  return comparisonMetric(null, null, null, "unavailable");
}

export function unavailableRate(): RateMetric {
  return { value: null, numerator: 0, denominator: 0, availability: "unavailable" };
}
