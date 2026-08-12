import "server-only";
import { GatewayAiProvider } from "@/lib/ai/providers/gateway";
import type { AiProvider } from "@/lib/ai/providers/types";

let provider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  provider ??= new GatewayAiProvider();
  return provider;
}
