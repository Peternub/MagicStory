import "server-only";

type ChildProfile = {
  name: string;
  age: number;
  interests: string | null;
  fears: string | null;
  additional_context: string | null;
};

type GenerateStoryParams = {
  child: ChildProfile;
  theme: string;
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

function buildPrompt(child: ChildProfile, theme: string) {
  return [
    "Ты детский автор добрых персональных сказок на русском языке.",
    "Напиши сказку без медицинских и психотерапевтических формулировок.",
    "Сделай текст мягким, теплым, безопасным и понятным для ребенка.",
    `Имя ребенка: ${child.name}.`,
    `Возраст: ${child.age}.`,
    `Интересы: ${child.interests || "не указаны"}.`,
    `Страхи: ${child.fears || "не указаны"}.`,
    `Дополнительный контекст: ${child.additional_context || "не указан"}.`,
    `Тема дня: ${theme}.`,
    "Сначала выведи короткий заголовок на первой строке.",
    "Дальше после пустой строки выведи саму сказку длиной 8-12 абзацев."
  ].join("\n");
}

function parseStoryContent(content: string): Pick<GeneratedStory, "title" | "text"> {
  const normalized = content.trim();
  const [firstLine, ...rest] = normalized.split("\n");
  const title = firstLine.replace(/^#+\s*/, "").trim() || "Новая сказка";
  const text = rest.join("\n").trim() || normalized;

  return { title, text };
}

function joinOptionalParts(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function generateFallbackStory({
  child,
  theme
}: GenerateStoryParams): GeneratedStory {
  const title = `Как ${child.name} справился с темой "${theme}"`;

  const interests = child.interests
    ? `Больше всего ${child.name.toLowerCase()} любит ${child.interests}.`
    : "";
  const fears = child.fears
    ? `Иногда его беспокоит ${child.fears}.`
    : "";
  const context = child.additional_context
    ? `Родители также рассказали, что ${child.additional_context}.`
    : "";

  const text = joinOptionalParts([
    `${child.name} был ребенком ${child.age} лет с очень живым воображением.`,
    interests,
    fears,
    context,
    `Однажды случилась важная история: ${theme}.`,
    `Сначала ${child.name.toLowerCase()} не знал, как правильно поступить, и поэтому немного растерялся.`,
    `Но рядом появился добрый сказочный помощник, который предложил посмотреть на ситуацию спокойно и по шагам.`,
    `Они вместе заметили, что любой трудный момент становится легче, если назвать свои чувства, попросить помощь и сделать маленький полезный шаг.`,
    `Тогда ${child.name.toLowerCase()} попробовал поступить по-новому: внимательно выслушал взрослых, вспомнил о том, что важно для близких, и сделал одно доброе действие прямо сейчас.`,
    `Постепенно тревога ушла, а на ее место пришли уверенность, тепло и гордость за себя.`,
    `С тех пор ${child.name.toLowerCase()} помнил: даже если тема дня кажется сложной, внутри всегда есть сила выбрать добрый и смелый путь.`,
    `Вечером ${child.name.toLowerCase()} уснул с ощущением, что стал еще немного взрослее, добрее и мудрее.`
  ]);

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
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content:
            "Ты пишешь добрые русскоязычные персональные сказки для детей."
        },
        {
          role: "user",
          content: buildPrompt(params.child, params.theme)
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
    provider: "openai-compatible"
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
