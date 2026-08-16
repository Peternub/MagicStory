import { describe, expect, test } from "bun:test";
import { getGenerationActionError } from "./generation-errors";

describe("сообщения об ошибках создания сказки", () => {
  test("объясняет долгое ожидание", () => {
    expect(getGenerationActionError(new Error("OPENAI_TIMEOUT"))).toContain("слишком много времени");
    expect(getGenerationActionError(new Error("AI_GATEWAY_TIMEOUT"))).toContain("слишком много времени");
  });

  test("объясняет временную перегрузку", () => {
    expect(getGenerationActionError(new Error("OPENAI_RATE_LIMIT"))).toContain("перегружен");
    expect(getGenerationActionError(new Error("GATEWAY_RATE_LIMIT"))).toContain("перегружен");
  });

  test("объясняет временную недоступность", () => {
    expect(getGenerationActionError(new Error("OPENAI_UNAVAILABLE"))).toContain("временно недоступен");
    expect(getGenerationActionError(new Error("connect ECONNREFUSED"))).toContain("временно недоступен");
  });

  test("сохраняет сообщения для состояний серии", () => {
    expect(getGenerationActionError(new Error("GENERATION_IN_PROGRESS"))).toContain("уже создаётся");
    expect(getGenerationActionError(new Error("FAILED_EPISODE_REQUIRES_RETRY"))).toContain("незавершённую");
    expect(getGenerationActionError(new Error("SERIES_COMPLETED"))).toContain("уже созданы");
  });

  test("не показывает неизвестный технический код", () => {
    expect(getGenerationActionError({ message: "INTERNAL_UNKNOWN_CODE" })).toBe(
      "Не удалось создать серию. Попробуйте ещё раз."
    );
  });
});
