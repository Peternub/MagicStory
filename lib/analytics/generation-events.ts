export type GenerationErrorCategory =
  | "timeout"
  | "rate_limit"
  | "unavailable"
  | "invalid_response"
  | "configuration"
  | "database"
  | "unknown";

export function classifyGenerationError(error: unknown): GenerationErrorCategory {
  const message = error instanceof Error ? error.message.toUpperCase() : "";
  if (message.includes("TIMEOUT") || message.includes("ABORT")) return "timeout";
  if (message.includes("RATE_LIMIT") || message.includes("HTTP_429")) return "rate_limit";
  if (message.includes("NOT_CONFIGURED") || message.includes("CONFIG")) return "configuration";
  if (message.includes("INVALID") || message.includes("REFUSAL") || message.includes("EMPTY_RESPONSE")) {
    return "invalid_response";
  }
  if (message.includes("DATABASE") || message.includes("POSTGRES") || message.includes("ECONNREFUSED")) {
    return "database";
  }
  if (message.includes("UNAVAILABLE") || message.includes("GATEWAY") || message.includes("FETCH")) {
    return "unavailable";
  }
  return "unknown";
}
