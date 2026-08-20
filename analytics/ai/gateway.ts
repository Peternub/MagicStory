import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { AnalysisTransport } from "./analyzer";

export function createAnalyticsGatewayTransport(config: {
  baseUrl: string;
  sharedSecret: string;
  model: string;
  caFile?: string;
}): AnalysisTransport {
  return async (payload) => {
    const url = new URL("/v1/generate", config.baseUrl);
    const body = JSON.stringify({
      requestId: createHash("sha256").update(payload.input).digest("hex"),
      model: config.model,
      instructions: payload.instructions,
      input: payload.input,
      schema: payload.schema
    });
    const ca = config.caFile ? await readFile(config.caFile) : undefined;
    const requestImpl = url.protocol === "https:" ? httpsRequest : httpRequest;
    const response = await new Promise<{ status: number; body: string }>((resolve, reject) => {
      const request = requestImpl(url, {
        method: "POST",
        ca,
        headers: {
          Authorization: `Bearer ${config.sharedSecret}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      }, (incoming) => {
        const chunks: Buffer[] = [];
        incoming.on("data", (chunk: Buffer) => chunks.push(chunk));
        incoming.on("end", () => resolve({
          status: incoming.statusCode ?? 502,
          body: Buffer.concat(chunks).toString("utf8")
        }));
      });
      request.setTimeout(100_000, () => request.destroy(new Error("ANALYTICS_AI_TIMEOUT")));
      request.on("error", reject);
      request.end(body);
    });
    if (response.status < 200 || response.status >= 300) throw new Error("ANALYTICS_AI_UNAVAILABLE");
    const parsed = JSON.parse(response.body) as { output?: unknown };
    if (typeof parsed.output !== "string") throw new Error("ANALYTICS_AI_INVALID_RESPONSE");
    return { output: parsed.output };
  };
}
