import { z } from "zod";
import type { AiAnalysis, NormalizedMetrics, RuleResults, SystemHealth } from "../types";

const analysisSchema = z.object({
  summary: z.string().min(1).max(500),
  positiveSignals: z.array(z.string().min(1).max(300)).max(5),
  problems: z.array(z.object({
    severity: z.enum(["warning", "critical"]),
    title: z.string().min(1).max(160),
    explanation: z.string().min(1).max(400)
  }).strict()).max(5),
  actions: z.array(z.object({
    priority: z.number().int().min(1).max(3),
    action: z.string().min(1).max(300),
    reason: z.string().min(1).max(300)
  }).strict()).max(3)
}).strict();

export const analyticsResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    positiveSignals: { type: "array", items: { type: "string" }, maxItems: 5 },
    problems: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          severity: { type: "string", enum: ["warning", "critical"] },
          title: { type: "string" },
          explanation: { type: "string" }
        },
        required: ["severity", "title", "explanation"]
      }
    },
    actions: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          priority: { type: "integer", minimum: 1, maximum: 3 },
          action: { type: "string" },
          reason: { type: "string" }
        },
        required: ["priority", "action", "reason"]
      }
    }
  },
  required: ["summary", "positiveSignals", "problems", "actions"]
} as const;

export type AnalysisTransport = (request: {
  instructions: string;
  input: string;
  schema: Record<string, unknown>;
}) => Promise<{ output: string }>;

function assertAnonymousPacket(serialized: string) {
  if (
    /[\w.+-]+@[\w.-]+\.[A-Za-zА-Яа-яЁё]{2,}/u.test(serialized)
    || /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/iu.test(serialized)
    || /(?:api[_-]?key|access[_-]?token|password|session[_-]?id)/iu.test(serialized)
  ) {
    throw new Error("ANALYTICS_PERSONAL_DATA_DETECTED");
  }
}

export function buildAiAnalysisPacket(
  metrics: NormalizedMetrics,
  rules: RuleResults,
  health?: SystemHealth
) {
  const packet = { metrics, rules, health: health ?? null };
  const serialized = JSON.stringify(packet);
  assertAnonymousPacket(serialized);
  return serialized;
}

export async function analyzeMetrics(
  metrics: NormalizedMetrics,
  rules: RuleResults,
  transport: AnalysisTransport,
  health?: SystemHealth
): Promise<AiAnalysis | null> {
  try {
    const output = await transport({
      instructions: [
        "Ты внутренний аналитик SkazKIDS.",
        "Не пересчитывай числа и не утверждай причинность без доказательств.",
        "Отделяй факт от гипотезы и явно отмечай недостаток данных.",
        "Приоритеты Rule Engine нельзя понижать или скрывать.",
        "Верни только JSON по схеме."
      ].join(" "),
      input: buildAiAnalysisPacket(metrics, rules, health),
      schema: analyticsResponseSchema
    });
    return analysisSchema.parse(JSON.parse(output.output));
  } catch {
    return null;
  }
}
