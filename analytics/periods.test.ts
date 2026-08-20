import { describe, expect, test } from "bun:test";
import { buildAnalyticsPeriods, getReportDate } from "./periods";

describe("периоды Analytics MVP", () => {
  test("строит непересекающиеся интервалы по 24 часа", () => {
    const periods = buildAnalyticsPeriods(
      new Date("2026-08-20T07:00:00.000Z"),
      "Europe/Moscow"
    );

    expect(periods.current).toEqual({
      from: "2026-08-19T07:00:00.000Z",
      to: "2026-08-20T07:00:00.000Z"
    });
    expect(periods.previous).toEqual({
      from: "2026-08-18T07:00:00.000Z",
      to: "2026-08-19T07:00:00.000Z"
    });
    expect(periods.baseline).toEqual({
      from: "2026-08-11T07:00:00.000Z",
      to: "2026-08-18T07:00:00.000Z",
      days: 7
    });
  });

  test("определяет дату отчёта в настроенной timezone", () => {
    expect(getReportDate(new Date("2026-08-19T21:30:00.000Z"), "Europe/Moscow"))
      .toBe("2026-08-20");
  });

  test("отклоняет неизвестную timezone", () => {
    let message = "";
    try {
      buildAnalyticsPeriods(new Date(), "Mars/Olympus");
    } catch (error) {
      message = error instanceof Error ? error.message : "UNKNOWN";
    }
    expect(message).toBe("ANALYTICS_INVALID_TIMEZONE");
  });
});
