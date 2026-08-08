import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  StoryPseudonymizer,
  type PrivateAliases
} from "@/lib/ai/pseudonymization";
import {
  isSeriesMemory,
  type SeriesMemory
} from "@/lib/ai/story-memory";
import type { StoryInput } from "@/lib/validators/stories";

type ChildProfile = {
  name: string;
  age: number;
  gender: "boy" | "girl";
  interests?: string | null;
  fears?: string | null;
  additional_context?: string | null;
};

export type GenerateStoryParams = {
  child: ChildProfile;
  request: StoryInput;
  episodeNumber: number;
  plannedEpisodes: number;
  seriesMemory: SeriesMemory;
  privateAliases?: PrivateAliases;
  safetyIdentifier: string;
  modelCode?: string;
};

export type GeneratedStory = {
  title: string;
  text: string;
  summary: string;
  memory: SeriesMemory;
  privateAliases: PrivateAliases;
  provider: string;
};

type OpenAiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
      refusal?: string | null;
    };
  }>;
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    text: { type: "string" },
    summary: { type: "string" },
    memory: {
      type: "object",
      additionalProperties: false,
      properties: {
        characters: { type: "array", items: { type: "string" } },
        facts: { type: "array", items: { type: "string" } },
        open_threads: { type: "array", items: { type: "string" } },
        episode_summaries: { type: "array", items: { type: "string" } }
      },
      required: ["characters", "facts", "open_threads", "episode_summaries"]
    }
  },
  required: ["title", "text", "summary", "memory"]
} as const;

const generatedStorySchema = z.object({
  title: z.string().min(1).max(160),
  text: z.string().min(1),
  summary: z.string().min(1).max(500),
  memory: z.unknown()
});

function getGenderLabel(gender: ChildProfile["gender"]) {
  return gender === "girl" ? "девочка" : "мальчик";
}

export function createSafetyIdentifier(userId: string) {
  return createHash("sha256").update(`magic-story:${userId}`).digest("hex");
}

export function buildSeriesPrompt(params: {
  child: ChildProfile;
  request: StoryInput;
  episodeNumber: number;
  plannedEpisodes: number;
  seriesMemory: SeriesMemory;
}) {
  const { child, request, episodeNumber, plannedEpisodes, seriesMemory } = params;

  return [
    "Напиши вечернюю серию детского сериала на русском языке для ребёнка 3–7 лет.",
    `Это серия ${episodeNumber} из ${plannedEpisodes}. Длительность чтения — около 5 минут, 700–950 слов.`,
    "Все обозначения вида {{CHILD_NAME}} и {{PERSON_1}} являются именами героев: используй их без изменений.",
    "Стиль: живой, тёплый, спокойный; конкретные действия; короткие диалоги; мягкий юмор.",
    "Не используй старинный сказочный язык, прямую мораль, психологические термины и тревожный клиффхэнгер.",
    "Начни сразу со сцены. Сделай 7–12 абзацев. Финал должен успокаивать и оставлять лёгкий повод вернуться завтра.",
    "Не пересказывай прошлые серии. Используй только память ниже.",
    "",
    "ПРОФИЛЬ:",
    `Имя: ${child.name}`,
    `Возраст: ${child.age}`,
    `Пол: ${getGenderLabel(child.gender)}`,
    `Интересы: ${child.interests || "не указаны"}`,
    `Что важно учитывать: ${child.fears || "не указано"}`,
    `Близкие и питомцы: ${child.additional_context || "не указаны"}`,
    "",
    "СЕГОДНЯШНЯЯ СЕРИЯ:",
    `Событие: ${request.situation}`,
    `Место: ${request.setting}`,
    `Персонажи: ${request.additionalCharacters || "из памяти сериала"}`,
    `Изменение к финалу: ${request.goal}`,
    `Паспорт и пожелания: ${request.extraWishes || "нет"}`,
    "",
    "ПАМЯТЬ СЕРИАЛА:",
    JSON.stringify(seriesMemory),
    "",
    "Верни заголовок, полный текст, краткое содержание и обновлённую память. В памяти оставь только важные постоянные факты."
  ].join("\n");
}

function preparePseudonymizedInput(params: GenerateStoryParams) {
  const pseudonymizer = new StoryPseudonymizer(params.privateAliases);
  pseudonymizer.registerChildName(params.child.name);

  const values = [
    params.child.interests,
    params.child.fears,
    params.child.additional_context,
    params.request.situation,
    params.request.setting,
    params.request.additionalCharacters,
    params.request.goal,
    params.request.extraWishes
  ];
  values.forEach((value) => pseudonymizer.scan(value));

  return {
    pseudonymizer,
    child: {
      ...params.child,
      name: pseudonymizer.mask(params.child.name),
      interests: pseudonymizer.mask(params.child.interests),
      fears: pseudonymizer.mask(params.child.fears),
      additional_context: pseudonymizer.mask(params.child.additional_context)
    },
    request: {
      ...params.request,
      durationMinutes: 5 as const,
      situation: pseudonymizer.mask(params.request.situation),
      setting: pseudonymizer.mask(params.request.setting),
      additionalCharacters: pseudonymizer.mask(params.request.additionalCharacters),
      goal: pseudonymizer.mask(params.request.goal),
      extraWishes: pseudonymizer.mask(params.request.extraWishes)
    }
  };
}

export async function generateStory(params: GenerateStoryParams): Promise<GeneratedStory> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = params.modelCode || process.env.OPENAI_MODEL || "gpt-5.6-terra";

  if (!apiKey) {
    throw new Error("OPENAI_NOT_CONFIGURED");
  }

  const prepared = preparePseudonymizedInput(params);
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      safety_identifier: params.safetyIdentifier,
      messages: [
        {
          role: "system",
          content: "Ты создаёшь безопасные связанные серии для семейного чтения перед сном."
        },
        {
          role: "user",
          content: buildSeriesPrompt({
            child: prepared.child,
            request: prepared.request,
            episodeNumber: params.episodeNumber,
            plannedEpisodes: params.plannedEpisodes,
            seriesMemory: params.seriesMemory
          })
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "series_episode",
          strict: true,
          schema: responseSchema
        }
      }
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`OPENAI_REQUEST_FAILED_${response.status}`);
  }

  const data = (await response.json()) as OpenAiResponse;
  const message = data.choices?.[0]?.message;

  if (message?.refusal) {
    throw new Error("OPENAI_REFUSED_STORY");
  }

  if (!message?.content) {
    throw new Error("OPENAI_EMPTY_RESPONSE");
  }

  const parsed = JSON.parse(message.content) as unknown;
  const result = generatedStorySchema.safeParse(parsed);

  if (!result.success) {
    throw new Error("OPENAI_INVALID_STRUCTURED_RESPONSE");
  }

  if (!isSeriesMemory(result.data.memory)) {
    throw new Error("OPENAI_INVALID_MEMORY");
  }

  return {
    title: prepared.pseudonymizer.restore(result.data.title),
    text: prepared.pseudonymizer.restore(result.data.text),
    summary: result.data.summary,
    memory: result.data.memory,
    privateAliases: prepared.pseudonymizer.toJSON(),
    provider: model
  };
}
