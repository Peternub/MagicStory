export function shouldRetryGatewayRequest(
  status: number | undefined,
  code: string,
  attempt: number,
  maxAttempts: number
) {
  if (attempt >= maxAttempts) return false;
  if (status === undefined) return true;
  if (status === 502 || status === 503 || status === 504) return true;
  return status === 429 && code === "OPENAI_RATE_LIMIT";
}
