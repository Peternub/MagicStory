import { describe, expect, test } from "bun:test";
import { classifyGenerationError } from "./generation-events";

describe("категории ошибок AI", () => {
  test("не сохраняет сырой текст ошибки как категорию", () => {
    expect(classifyGenerationError(new Error("AI_GATEWAY_TIMEOUT secret details"))).toBe("timeout");
    expect(classifyGenerationError(new Error("OPENAI_RATE_LIMIT"))).toBe("rate_limit");
    expect(classifyGenerationError(new Error("OPENAI_INVALID_RESPONSE"))).toBe("invalid_response");
    expect(classifyGenerationError(new Error("неизвестный внутренний текст"))).toBe("unknown");
  });
});
