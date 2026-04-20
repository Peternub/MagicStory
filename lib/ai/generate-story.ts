import "server-only";
import type { StoryInput } from "@/lib/validators/stories";

type ChildProfile = {
  name: string;
  age: number;
  gender: "boy" | "girl";
};

type GenerateStoryParams = {
  child: ChildProfile;
  request: StoryInput;
};

type GeneratedStory = {
  title: string;
  text: string;
  provider: string;
};

type OpenAiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function getTargetLength(minutes: number) {
  switch (minutes) {
    case 3:
      return "700-900 слов";
    case 5:
      return "1000-1300 слов";
    case 7:
      return "1300-1700 слов";
    case 10:
      return "1700-2200 слов";
    default:
      return "1000-1300 слов";
  }
}

function getGenderLabel(gender: ChildProfile["gender"]) {
  return gender === "girl" ? "девочка" : "мальчик";
}

function buildPrompt(child: ChildProfile, request: StoryInput) {
  return [
    "Ты сильный русскоязычный автор детских сказок для вечернего чтения.",
    "Нужна полноценная художественная сказка без сухих объяснений и без пересказа анкеты.",
    "Пиши мягко, тепло, понятно и увлекательно.",
    "Сказка должна помогать ребенку прожить конкретную ситуацию дня через образный, но ясный сюжет.",
    "Без медицинских, терапевтических и назидательных формулировок.",
    `Имя ребенка: ${child.name}.`,
    `Возраст: ${child.age}.`,
    `Пол: ${getGenderLabel(child.gender)}.`,
    `Ситуация дня: ${request.situation}.`,
    `Место действия: ${request.setting}.`,
    `Главная цель сказки: ${request.goal}.`,
    `Дополнительные пожелания: ${request.extraWishes || "без дополнительных пожеланий"}.`,
    `Длительность чтения: около ${request.durationMinutes} минут.`,
    `Целевая длина: ${getTargetLength(request.durationMinutes)}.`,
    "Сделай заголовок на первой строке.",
    "После пустой строки дай саму сказку.",
    "Сказка должна состоять из 8-14 абзацев.",
    "Начни с живой сцены, а не с формулы 'жил-был'."
  ].join("\n");
}

function parseStoryContent(content: string): Pick<GeneratedStory, "title" | "text"> {
  const normalized = content.trim();
  const [firstLine, ...rest] = normalized.split("\n");
  const title = firstLine.replace(/^#+\s*/, "").trim() || "Новая сказка";
  const text = rest.join("\n").trim() || normalized;

  return { title, text };
}

function generateFallbackStory({
  child,
  request
}: GenerateStoryParams): GeneratedStory {
  const title = `${child.name} и история про ${request.goal}`;

  const text = [
    `В месте под названием ${request.setting} вечер начинался тихо и мягко. ${child.name}, ${getGenderLabel(child.gender)} ${child.age} лет, чувствовал, что день был непростым: ${request.situation}.`,
    `Сначала все эти мысли казались слишком большими, чтобы с ними можно было легко справиться. Но в мире сказки даже сложный день умеет понемногу распутываться, если рядом появляются добрые знаки и спокойные подсказки.`,
    `Вдруг неподалеку случилось маленькое чудо: вокруг как будто стало тише, воздух потеплел, а сама дорога вперед уже не выглядела такой трудной. ${child.name} сделал первый маленький шаг и заметил, что от этого становится спокойнее.`,
    `Постепенно история привела к простому, но важному открытию: даже если день вышел тяжелым, его можно прожить мягче и бережнее к себе. Именно так и раскрывалась главная тема сказки — ${request.goal}.`,
    `Чем дальше двигался сюжет, тем яснее становилось, что хорошее решение не обязано быть громким. Иногда оно приходит как тихая мысль, как добрый взгляд, как возможность остановиться, выдохнуть и попробовать еще раз.`,
    request.extraWishes
      ? `В этой истории особенно чувствовалось и то, о чем попросил родитель: ${request.extraWishes}. Это делало сказку еще ближе и теплее.`
      : `История оставалась спокойной, ясной и уютной, чтобы ее было приятно слушать перед сном.`,
    `Когда все стало на свои места, ${child.name} почувствовал, что внутри стало легче. День уже не казался таким тяжелым, а впереди ждал спокойный и добрый вечер.`,
    `И когда сказка закончилась, в ${request.setting} стало совсем тихо. С собой осталось главное чувство: даже сложный день может завершиться мягко, тепло и хорошо.`
  ].join("\n\n");

  return {
    title,
    text,
    provider: "fallback"
  };
}

async function generateWithOpenAiCompatible(
  params: GenerateStoryParams
): Promise<GeneratedStory | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL;
  const model = process.env.OPENAI_MODEL || "gpt-5.4-nano";

  if (!apiKey || !baseUrl) {
    return null;
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.55,
      messages: [
        {
          role: "system",
          content:
            "Ты пишешь сильные русскоязычные сказки для детей и умеешь делать их теплыми, длинными и понятными."
        },
        {
          role: "user",
          content: buildPrompt(params.child, params.request)
        }
      ]
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("OPENAI_COMPATIBLE_REQUEST_FAILED");
  }

  const data = (await response.json()) as OpenAiResponse;
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OPENAI_COMPATIBLE_EMPTY_RESPONSE");
  }

  return {
    ...parseStoryContent(content),
    provider: model
  };
}

export async function generateStory(
  params: GenerateStoryParams
): Promise<GeneratedStory> {
  try {
    const aiStory = await generateWithOpenAiCompatible(params);

    if (aiStory) {
      return aiStory;
    }
  } catch {
    return generateFallbackStory(params);
  }

  return generateFallbackStory(params);
}
