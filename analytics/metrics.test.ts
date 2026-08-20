import { describe, expect, test } from "bun:test";
import { comparisonMetric, rateMetric } from "./metrics";

describe("нормализация аналитических метрик", () => {
  test("считает изменения кодом", () => {
    expect(comparisonMetric(15, 10, 12)).toEqual({
      current: 15,
      previous: 10,
      baseline: 12,
      changeVsPreviousPercent: 50,
      changeVsBaselinePercent: 25,
      availability: "available"
    });
  });

  test("не выдумывает процент при нулевой базе", () => {
    expect(comparisonMetric(2, 0, 0).changeVsBaselinePercent).toBe(null);
  });

  test("возвращает insufficient_data для малой когорты", () => {
    expect(rateMetric(3, 7, 10)).toEqual({
      value: null,
      numerator: 3,
      denominator: 7,
      availability: "insufficient_data"
    });
  });
});
