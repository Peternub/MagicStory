import { z } from "zod";

const modelPricingSchema = z.object({
  inputPerMillionUsd: z.number().nonnegative(),
  outputPerMillionUsd: z.number().nonnegative()
});

const pricingConfigSchema = z.record(modelPricingSchema);

export type AiPricingConfig = z.infer<typeof pricingConfigSchema>;

export function parseAiPricingConfig(value: string | undefined): AiPricingConfig {
  if (!value) return {};
  try {
    return pricingConfigSchema.parse(JSON.parse(value));
  } catch {
    throw new Error("AI_PRICING_CONFIG_INVALID");
  }
}

export function estimateAiCostUsd(input: {
  model: string;
  inputTokens: number;
  outputTokens: number;
  config?: AiPricingConfig;
}) {
  const config = input.config ?? parseAiPricingConfig(process.env.AI_PRICING_CONFIG);
  const pricing = config[input.model];
  if (!pricing) return null;

  const cost = (
    input.inputTokens * pricing.inputPerMillionUsd
    + input.outputTokens * pricing.outputPerMillionUsd
  ) / 1_000_000;
  return Math.round(cost * 1_000_000) / 1_000_000;
}
