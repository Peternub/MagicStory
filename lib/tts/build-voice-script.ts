import "server-only";

export type TtsSegmentRole = "narrator" | "female" | "male" | "child";

export type TtsSegment = {
  role: TtsSegmentRole;
  text: string;
  character?: string | null;
};

type OpenAiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function normalizeText(text: string) {
  return text.replace(/\r/g, "").trim();
}

function extractJson(content: string) {
  const trimmed = content.trim();

  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");
  }

  return trimmed;
}

function parseSegments(content: string): TtsSegment[] | null {
  try {
    const parsed = JSON.parse(extractJson(content));

    if (!Array.isArray(parsed)) {
      return null;
    }

    const segments = parsed
      .map((item): TtsSegment | null => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const role = item.role;
        const text = item.text;
        const character = item.character;

        if (
          role !== "narrator" &&
          role !== "female" &&
          role !== "male" &&
          role !== "child"
        ) {
          return null;
        }

        if (typeof text !== "string" || !text.trim()) {
          return null;
        }
        return {
          role,
          text: text.trim(),
          character: typeof character === "string" ? character.trim() : null
        };
      })
      .filter((item): item is TtsSegment => Boolean(item));

    return segments.length > 0 ? segments : null;
  } catch {
    return null;
  }
}

function buildFallbackSegments(text: string): TtsSegment[] {
  const normalized = normalizeText(text);

  if (!normalized) {
    return [];
  }

  return [
    {
      role: "narrator",
      text: normalized
    }
  ];
}

export async function buildVoiceScript(input: {
  text: string;
  characters?: string | null;
}): Promise<TtsSegment[]> {
  const normalizedText = normalizeText(input.text);

  if (!normalizedText) {
    return [];
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL;
  const model = process.env.OPENAI_MODEL || "gpt-5.4-nano";

  if (!apiKey || !baseUrl) {
    return buildFallbackSegments(normalizedText);
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Ты размечаешь детскую сказку для озвучки. Верни только JSON-массив сегментов без пояснений."
        },
        {
          role: "user",
          content: [
            "Разбей текст сказки на сегменты для озвучки.",
            "Каждый сегмент должен быть объектом JSON формата {\"role\":\"narrator|female|male|child\",\"character\":\"имя или null\",\"text\":\"текст сегмента\"}.",
            "Если это обычное авторское повествование, ставь role=narrator.",
            "Если это реплика женского персонажа, ставь role=female.",
            "Если это реплика мужского персонажа, ставь role=male.",
            "Если это реплика ребенка без явного пола, ставь role=child.",
            "Не выдумывай новый текст и не сокращай исходный текст.",
            "Не меняй порядок событий.",
            "Если не уверен, ставь narrator.",
            `Дополнительные персонажи из формы: ${input.characters || "не указаны"}.`,
            "Текст сказки:",
            normalizedText
          ].join("\n")
        }
      ]
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    return buildFallbackSegments(normalizedText);
  }

  const data = (await response.json()) as OpenAiResponse;
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    return buildFallbackSegments(normalizedText);
  }

  return parseSegments(content) ?? buildFallbackSegments(normalizedText);
}
