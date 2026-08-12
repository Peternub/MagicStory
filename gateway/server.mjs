import { randomUUID, timingSafeEqual } from "node:crypto";

const DEFAULT_PORT = 3100;
const DEFAULT_TIMEOUT_MS = 90_000;
const DEFAULT_MAX_BODY_BYTES = 160_000;
const DEFAULT_RATE_LIMIT = 20;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ITEMS = 50;

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function readPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getClientIp(request) {
  return request.headers.get("x-real-ip") || "unknown";
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateGenerateRequest(value, allowedModels) {
  if (!isRecord(value)) {
    return "INVALID_BODY";
  }

  if (
    typeof value.requestId !== "string" ||
    !/^[a-f0-9]{64}$/.test(value.requestId) ||
    typeof value.model !== "string" ||
    !allowedModels.has(value.model) ||
    typeof value.instructions !== "string" ||
    value.instructions.length < 1 ||
    value.instructions.length > 4_000 ||
    typeof value.input !== "string" ||
    value.input.length < 1 ||
    value.input.length > 120_000 ||
    !isRecord(value.schema)
  ) {
    return "INVALID_GENERATION_REQUEST";
  }

  const serialized = `${value.instructions}\n${value.input}`;
  if (
    /[\w.+-]+@[\w.-]+\.[A-Za-zА-Яа-яЁё]{2,}/u.test(serialized) ||
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/iu.test(serialized)
  ) {
    return "PERSONAL_IDENTIFIER_DETECTED";
  }

  return null;
}

function extractOutputText(response) {
  if (typeof response.output_text === "string" && response.output_text) {
    return response.output_text;
  }

  for (const item of Array.isArray(response.output) ? response.output : []) {
    if (!isRecord(item) || item.type !== "message" || !Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (isRecord(content) && content.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
      if (isRecord(content) && content.type === "refusal") {
        throw new Error("OPENAI_REFUSAL");
      }
    }
  }

  throw new Error("OPENAI_EMPTY_RESPONSE");
}

function mapOpenAiStatus(status) {
  if (status === 429) return { status: 429, code: "OPENAI_RATE_LIMIT" };
  if (status === 408) return { status: 504, code: "OPENAI_TIMEOUT" };
  if (status >= 500) return { status: 502, code: "OPENAI_UNAVAILABLE" };
  return { status: 502, code: "OPENAI_REQUEST_FAILED" };
}

function logTechnical(logger, details) {
  logger(JSON.stringify({ timestamp: new Date().toISOString(), ...details }));
}

export function createGatewayHandler(options = {}) {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const logger = options.logger ?? console.log;
  const sharedSecret = env.GATEWAY_SHARED_SECRET ?? "";
  const openAiApiKey = env.OPENAI_API_KEY ?? "";
  const openAiBaseUrl = (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const allowedModels = new Set(
    (env.OPENAI_MODELS || "gpt-5.6-terra")
      .split(",")
      .map((model) => model.trim())
      .filter(Boolean)
  );
  const timeoutMs = readPositiveInteger(env.OPENAI_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  const maxBodyBytes = readPositiveInteger(env.MAX_BODY_BYTES, DEFAULT_MAX_BODY_BYTES);
  const rateLimit = readPositiveInteger(env.RATE_LIMIT_PER_MINUTE, DEFAULT_RATE_LIMIT);
  const counters = new Map();
  const idempotencyCache = new Map();

  function cleanCaches(now) {
    for (const [key, value] of counters) {
      if (now - value.windowStartedAt >= 60_000) counters.delete(key);
    }
    for (const [key, value] of idempotencyCache) {
      if (value.expiresAt <= now) idempotencyCache.delete(key);
    }
    while (idempotencyCache.size > CACHE_MAX_ITEMS) {
      idempotencyCache.delete(idempotencyCache.keys().next().value);
    }
  }

  function consumeRateLimit(key, now) {
    const current = counters.get(key);
    if (!current || now - current.windowStartedAt >= 60_000) {
      counters.set(key, { count: 1, windowStartedAt: now });
      return true;
    }
    current.count += 1;
    return current.count <= rateLimit;
  }

  async function callOpenAi(payload) {
    const response = await fetchImpl(`${openAiBaseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": payload.requestId
      },
      body: JSON.stringify({
        model: payload.model,
        instructions: payload.instructions,
        input: payload.input,
        store: false,
        reasoning: { effort: "low" },
        text: {
          format: {
            type: "json_schema",
            name: "series_episode",
            strict: true,
            schema: payload.schema
          }
        }
      }),
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!response.ok) {
      const mapped = mapOpenAiStatus(response.status);
      const error = new Error(mapped.code);
      error.httpStatus = mapped.status;
      throw error;
    }

    const data = await response.json();
    const output = extractOutputText(data);
    JSON.parse(output);

    return {
      model: typeof data.model === "string" ? data.model : payload.model,
      output,
      usage: {
        inputTokens: Number(data.usage?.input_tokens ?? 0),
        outputTokens: Number(data.usage?.output_tokens ?? 0),
        totalTokens: Number(data.usage?.total_tokens ?? 0)
      }
    };
  }

  return async function handle(request) {
    const requestStartedAt = Date.now();
    const gatewayRequestId = randomUUID();
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ status: "ok", providerConfigured: Boolean(openAiApiKey) });
    }

    if (request.method !== "POST" || url.pathname !== "/v1/generate") {
      return json({ error: "NOT_FOUND", requestId: gatewayRequestId }, 404);
    }

    if (!sharedSecret || !openAiApiKey) {
      return json({ error: "GATEWAY_NOT_CONFIGURED", requestId: gatewayRequestId }, 503);
    }

    const authorization = request.headers.get("authorization") ?? "";
    const expectedAuthorization = `Bearer ${sharedSecret}`;
    if (!safeEqual(authorization, expectedAuthorization)) {
      return json({ error: "UNAUTHORIZED", requestId: gatewayRequestId }, 401);
    }

    const now = Date.now();
    cleanCaches(now);
    if (!consumeRateLimit(getClientIp(request), now)) {
      return json(
        { error: "GATEWAY_RATE_LIMIT", requestId: gatewayRequestId },
        429,
        { "Retry-After": "60" }
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > maxBodyBytes) {
      return json({ error: "PAYLOAD_TOO_LARGE", requestId: gatewayRequestId }, 413);
    }

    let payload;
    try {
      const body = await request.text();
      if (Buffer.byteLength(body, "utf8") > maxBodyBytes) {
        return json({ error: "PAYLOAD_TOO_LARGE", requestId: gatewayRequestId }, 413);
      }
      payload = JSON.parse(body);
    } catch {
      return json({ error: "INVALID_JSON", requestId: gatewayRequestId }, 400);
    }

    const validationError = validateGenerateRequest(payload, allowedModels);
    if (validationError) {
      return json({ error: validationError, requestId: gatewayRequestId }, 400);
    }

    const cached = idempotencyCache.get(payload.requestId);
    if (cached) {
      const cachedResult = await cached.promise;
      return json({ ...cachedResult, requestId: gatewayRequestId, cached: true });
    }

    const promise = callOpenAi(payload);
    idempotencyCache.set(payload.requestId, {
      expiresAt: now + CACHE_TTL_MS,
      promise
    });

    try {
      const result = await promise;
      logTechnical(logger, {
        requestId: gatewayRequestId,
        model: result.model,
        durationMs: Date.now() - requestStartedAt,
        status: 200,
        usage: result.usage
      });
      return json({ ...result, requestId: gatewayRequestId, cached: false });
    } catch (error) {
      idempotencyCache.delete(payload.requestId);
      const isTimeout = error?.name === "TimeoutError" || error?.name === "AbortError";
      const status = isTimeout ? 504 : Number(error?.httpStatus ?? 502);
      const code = isTimeout ? "OPENAI_TIMEOUT" : error?.message || "OPENAI_INVALID_RESPONSE";
      logTechnical(logger, {
        requestId: gatewayRequestId,
        model: payload.model,
        durationMs: Date.now() - requestStartedAt,
        status,
        error: code
      });
      return json({ error: code, requestId: gatewayRequestId }, status);
    }
  };
}

if (import.meta.main) {
  const port = readPositiveInteger(process.env.PORT, DEFAULT_PORT);
  Bun.serve({
    hostname: "127.0.0.1",
    port,
    fetch: createGatewayHandler()
  });
  console.log(JSON.stringify({ event: "gateway_started", port }));
}
