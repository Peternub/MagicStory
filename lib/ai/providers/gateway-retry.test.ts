import { describe, expect, test } from "bun:test";
import { shouldRetryGatewayRequest } from "./gateway-retry";

describe("повторные запросы к AI-шлюзу", () => {
  test("повторяет временные ошибки шлюза и сетевой обрыв", () => {
    expect(shouldRetryGatewayRequest(502, "OPENAI_UNAVAILABLE", 1, 2)).toBe(true);
    expect(shouldRetryGatewayRequest(503, "GATEWAY_NOT_CONFIGURED", 1, 2)).toBe(true);
    expect(shouldRetryGatewayRequest(504, "OPENAI_TIMEOUT", 1, 2)).toBe(true);
    expect(shouldRetryGatewayRequest(undefined, "ECONNRESET", 1, 2)).toBe(true);
  });

  test("повторяет временное ограничение OpenAI", () => {
    expect(shouldRetryGatewayRequest(429, "OPENAI_RATE_LIMIT", 1, 2)).toBe(true);
  });

  test("не повторяет локальное ограничение и постоянные ошибки", () => {
    expect(shouldRetryGatewayRequest(429, "GATEWAY_RATE_LIMIT", 1, 2)).toBe(false);
    expect(shouldRetryGatewayRequest(400, "INVALID_GENERATION_REQUEST", 1, 2)).toBe(false);
    expect(shouldRetryGatewayRequest(401, "UNAUTHORIZED", 1, 2)).toBe(false);
  });

  test("не превышает максимальное число попыток", () => {
    expect(shouldRetryGatewayRequest(502, "OPENAI_UNAVAILABLE", 2, 2)).toBe(false);
    expect(shouldRetryGatewayRequest(undefined, "ECONNRESET", 2, 2)).toBe(false);
  });
});
