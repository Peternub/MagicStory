import "server-only";
import { readFile } from "node:fs/promises";
import { request as httpsRequest } from "node:https";
import { z } from "zod";
import type {
  AiProvider,
  GenerateEpisodeRequest,
  GenerateEpisodeResult
} from "@/lib/ai/providers/types";

const gatewayResponseSchema = z.object({
  output: z.string().min(1),
  model: z.string().min(1),
  usage: z.object({
    inputTokens: z.number().nonnegative(),
    outputTokens: z.number().nonnegative(),
    totalTokens: z.number().nonnegative()
  })
});

const gatewayErrorSchema = z.object({ error: z.string().optional() });

type GatewayConfig = {
  url: URL;
  secret: string;
  ca: Buffer;
  timeoutMs: number;
  maxAttempts: number;
};

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function readConfig(): Promise<GatewayConfig> {
  const url = process.env.AI_GATEWAY_URL;
  const secret = process.env.GATEWAY_SHARED_SECRET;
  const caFile = process.env.AI_GATEWAY_CA_FILE;

  if (!url || !secret || !caFile) throw new Error("AI_GATEWAY_NOT_CONFIGURED");

  return {
    url: new URL("/v1/generate", url),
    secret,
    ca: await readFile(caFile),
    timeoutMs: positiveInteger(process.env.AI_GATEWAY_TIMEOUT_MS, 100_000),
    maxAttempts: Math.min(3, positiveInteger(process.env.AI_GATEWAY_MAX_ATTEMPTS, 2))
  };
}

function postJson(config: GatewayConfig, body: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      config.url,
      {
        method: "POST",
        ca: config.ca,
        headers: {
          Authorization: `Bearer ${config.secret}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      },
      (response) => {
        const chunks: Buffer[] = [];
        let length = 0;

        response.on("data", (chunk: Buffer) => {
          length += chunk.length;
          if (length > 2_000_000) {
            request.destroy(new Error("AI_GATEWAY_RESPONSE_TOO_LARGE"));
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => {
          resolve({
            status: response.statusCode ?? 502,
            body: Buffer.concat(chunks).toString("utf8")
          });
        });
      }
    );

    request.setTimeout(config.timeoutMs, () => request.destroy(new Error("AI_GATEWAY_TIMEOUT")));
    request.on("error", reject);
    request.end(body);
  });
}

function retryableStatus(status: number) {
  return status === 502 || status === 503 || status === 504;
}

export class GatewayAiProvider implements AiProvider {
  async generateEpisode(request: GenerateEpisodeRequest): Promise<GenerateEpisodeResult> {
    const config = await readConfig();
    const body = JSON.stringify(request);
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt += 1) {
      try {
        const response = await postJson(config, body);
        if (response.status >= 200 && response.status < 300) {
          return gatewayResponseSchema.parse(JSON.parse(response.body));
        }

        const parsedError = gatewayErrorSchema.safeParse(JSON.parse(response.body));
        const code = parsedError.success && parsedError.data.error
          ? parsedError.data.error
          : `AI_GATEWAY_HTTP_${response.status}`;
        lastError = new Error(code);

        if (!retryableStatus(response.status) || attempt === config.maxAttempts) throw lastError;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("AI_GATEWAY_REQUEST_FAILED");
        if (attempt === config.maxAttempts || lastError.message === "AI_GATEWAY_RATE_LIMIT") {
          throw lastError;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
    }

    throw lastError ?? new Error("AI_GATEWAY_REQUEST_FAILED");
  }
}
