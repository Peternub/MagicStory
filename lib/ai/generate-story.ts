import "server-only";
import type { StoryInput } from "@/lib/validators/stories";

type ChildProfile = {
  name: string;
  age: number;
  interests: string | null;
  fears: string | null;
  additional_context: string | null;
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

function buildInterestGuidance(interests: string | null) {
  if (!interests) {
    return "Если интересы для этой сказки не указаны, не выдумывай их сам.";
  }

  const normalized = interests.toLowerCase();
  const hints: string[] = [
    "Не искажай формулировки интересов, указанных для этой сказки."
  ];

  if (normalized.includes("водное поло")) {
    hints.push(
      "Если указано 'водное поло', используй именно выражение 'водное поло'.",
      "Водное поло — это командная игра с мячом в бассейне. Не заменяй это на 'водную полосу', 'водную станцию' и другие искажения."
    );
  }

  return hints.join(" ");
}

function buildPrompt(child: ChildProfile, request: StoryInput) {
  const plotMode =
    request.mode === "guided"
      ? `Ситуация дня: ${request.situation}.`
      : "Сюжет придумай сам, но он должен быть цельным, понятным и небанальным.";

  return [
    "Ты сильный детский писатель русскоязычных сказок для вечернего чтения.",
    "Тебе нельзя писать краткую справку о ребенке или пересказ анкеты.",
    "Нужна полноценная художественная сказка, где действие начинается сразу.",
    "Пиши мягко, тепло, ясно и по-настоящему увлекательно.",
    "Запрещены медицинские, клинические и психотерапевтические формулировки.",
    `Роль ребенка в истории должна точно соответствовать указанию родителя: ${request.childRole}.`,
    "Если родитель указал, что ребенок вообще не участвует в сюжете, не вставляй ребенка в события сказки.",
    "Не искажай слова и выражения, которые задал родитель.",
    "Если родитель задал место действия или ситуацию, именно они должны быть основой сюжета.",
    "Интересы ребенка или дополнительные детали не должны перетягивать на себя всю сказку, если родитель задал другой центр истории.",
    "Если указаны дополнительные персонажи, относись к ним как к описаниям персонажей, а не как к буквальным репликам от первого лица.",
    "Не вставляй в текст персонажей с формулировками вроде 'я мама Марьяна'. Нужно нормализовать такие записи в естественную форму, например 'мама Марьяна'.",
    "Ребенок не называет свою маму по имени в каждой реплике. Если персонаж — мама, используй естественную форму 'мама', а имя добавляй только там, где это действительно уместно для автора.",
    "Нужен понятный сюжет с завязкой, развитием, препятствием, добрым преодолением и спокойным финалом.",
    "Сюжет должен быть понятным обычному ребенку и взрослому без странных абстракций.",
    "Не вводи сюрреалистические сущности, резкие нелогичные повороты и случайные метафоры, если об этом не просили.",
    "Все образы должны быть простыми, ясными и естественными для детской сказки.",
    `Имя ребенка: ${child.name}.`,
    `Возраст: ${child.age}.`,
    `Интересы для этой сказки: ${child.interests || "не указаны"}.`,
    buildInterestGuidance(child.interests),
    `Страхи для этой сказки: ${child.fears || "не указаны"}.`,
    `Дополнительный контекст для этой сказки: ${child.additional_context || "не указан"}.`,
    `Длительность чтения: около ${request.durationMinutes} минут.`,
    `Целевая длина: ${getTargetLength(request.durationMinutes)}.`,
    `Место действия: ${request.setting}.`,
    `Цель сказки: ${request.goal}.`,
    `Настроение сказки: ${request.tone}.`,
    `Роль ребенка в сказке: ${request.childRole}.`,
    `Дополнительные персонажи: ${request.characters || "не указаны"}.`,
    `Пожелания: ${request.extraWishes || "без дополнительных пожеланий"}.`,
    plotMode,
    "Сделай заголовок на первой строке.",
    "После пустой строки дай саму сказку.",
    "Сказка должна состоять из 8-14 абзацев.",
    "Не используй формулировки типа 'жил-был ребенок по имени...'.",
    "Начни с живой сцены, чтобы сразу было интересно."
  ].join("\n");
}

function parseStoryContent(content: string): Pick<GeneratedStory, "title" | "text"> {
  const normalized = content.trim();
  const [firstLine, ...rest] = normalized.split("\n");
  const title = firstLine.replace(/^#+\s*/, "").trim() || "Новая сказка";
  const text = rest.join("\n").trim() || normalized;

  return { title, text };
}

function buildAutoSituation(child: ChildProfile, request: StoryInput) {
  const interestHook = child.interests
    ? `все было связано с тем, что важной частью мира были ${child.interests}`
    : "вокруг происходило что-то необычное";

  return `в один вечер в месте под названием "${request.setting}" случилось маленькое приключение, и ${interestHook}`;
}

function generateFallbackStory({
  child,
  request
}: GenerateStoryParams): GeneratedStory {
  const situation =
    request.mode === "guided" && request.situation
      ? request.situation
      : buildAutoSituation(child, request);
  const companion =
    request.characters?.split(",")[0]?.trim() || "добрый спутник по имени Лучик";
  const title =
    request.mode === "guided"
      ? `${child.name} и история про ${request.goal}`
      : `Тайна места "${request.setting}"`;

  const intro = `В ${request.setting} вечер начинался тихо, но в воздухе уже чувствовалось, что сегодня произойдет нечто важное. Все вокруг было ${request.tone}, и даже самые обычные детали будто подсказывали: впереди особенная история.`;
  const interests = child.interests
    ? `В этой истории были важны и те детали, которые особенно откликаются ребенку: ${child.interests}. Но они не уводили сказку в сторону, а только делали мир живее и ближе.`
    : `История развивалась вокруг самого события, без лишних отвлечений.`;
  const conflict = `Главная трудность началась так: ${situation}. Сначала казалось, что разобраться в этом непросто, потому что чувства были сильными, а решение не приходило сразу.`;
  const companionScene = `Именно тогда рядом оказался ${companion}. Этот персонаж не говорил странно и не вмешивался навязчиво, а помог посмотреть на ситуацию спокойнее и добрее.`;
  const fearScene = child.fears
    ? `Даже если рядом мелькали переживания вроде "${child.fears}", история не превращалась в рассказ о страхе. Наоборот, она показывала, как можно пройти через трудный момент бережно и без лишнего напряжения.`
    : `Постепенно стало ясно, что любую сложность можно разобрать на маленькие понятные шаги.`;
  const growthScene = `Шаг за шагом герой сделал несколько спокойных и точных действий. Именно они помогли истории сдвинуться с места и превратить напряжение в понятное приключение.`;
  const goalScene = `Так в сказке и раскрылась главная тема — ${request.goal}. Важное изменение произошло не громко, а мягко и по-настоящему.`;
  const resolution = `Когда все закончилось, мир вокруг в ${request.setting} стал тише и добрее. Возникло ощущение, что нужное решение действительно найдено.`;
  const bedtime = `Перед сном в этой истории осталось главное чувство: спокойствие, тепло и уверенность, что даже сложный день может закончиться хорошо.`;

  const text = [
    intro,
    interests,
    conflict,
    companionScene,
    fearScene,
    growthScene,
    goalScene,
    resolution,
    bedtime
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
