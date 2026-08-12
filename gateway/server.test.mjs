import { describe, expect, test } from "bun:test";
import { createGatewayHandler } from "./server.mjs";

const env = {
  GATEWAY_SHARED_SECRET: "test-secret-longer-than-thirty-two-characters",
  OPENAI_API_KEY: "тестовый-ключ",
  OPENAI_MODELS: "gpt-5.6-terra"
};

function request(body, overrides = {}) {
  return new Request("http://127.0.0.1/v1/generate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GATEWAY_SHARED_SECRET}`,
      "Content-Type": "application/json",
      "X-Real-IP": "201.34.140.220",
      ...overrides.headers
    },
    body: JSON.stringify(body)
  });
}

const validBody = {
  requestId: "a".repeat(64),
  model: "gpt-5.6-terra",
  instructions: "Верни JSON.",
  input: "История про {{CHILD_NOM}}.",
  schema: { type: "object", additionalProperties: false, properties: {} }
};

describe("AI Gateway", () => {
  test("не принимает запрос без общего секрета", async () => {
    const handler = createGatewayHandler({ env, fetchImpl: async () => new Response() });
    const response = await handler(request(validBody, { headers: { Authorization: "Bearer invalid" } }));
    expect(response.status).toBe(401);
  });

  test("отклоняет email и UUID до отправки в OpenAI", async () => {
    let calls = 0;
    const handler = createGatewayHandler({
      env,
      fetchImpl: async () => {
        calls += 1;
        return new Response();
      }
    });
    const response = await handler(request({
      ...validBody,
      input: "email test@example.com, id 550e8400-e29b-41d4-a716-446655440000"
    }));
    expect(response.status).toBe(400);
    expect(calls).toBe(0);
  });

  test("возвращает структурированный результат без логирования текста", async () => {
    const logs = [];
    const handler = createGatewayHandler({
      env,
      logger: (line) => logs.push(line),
      fetchImpl: async () => jsonResponse({
        model: "gpt-5.6-terra",
        output: [{ type: "message", content: [{ type: "output_text", text: "{\"title\":\"Тест\"}" }] }],
        usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 }
      })
    });
    const response = await handler(request(validBody));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.output).toBe("{\"title\":\"Тест\"}");
    expect(logs.join(" ")).not.toContain("История");
    expect(logs.join(" ")).not.toContain("Тест");
  });

  test("повторный requestId не создаёт второй вызов OpenAI", async () => {
    let calls = 0;
    const handler = createGatewayHandler({
      env,
      fetchImpl: async () => {
        calls += 1;
        return jsonResponse({ output_text: "{}", usage: {} });
      }
    });
    expect((await handler(request(validBody))).status).toBe(200);
    expect((await handler(request(validBody))).status).toBe(200);
    expect(calls).toBe(1);
  });
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
