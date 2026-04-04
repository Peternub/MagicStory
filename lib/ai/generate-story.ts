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
    return "Если интересы не указаны, не выдумывай странные хобби.";
  }

  const normalized = interests.toLowerCase();
  const hints: string[] = [
    "Не искажай формулировки интересов из анкеты ребенка."
  ];

  if (normalized.includes("водное поло")) {
    hints.push(
      "Если указано 'водное поло', используй именно выражение 'водное поло'.",
      "Водное поло — это командная игра с мячом в бассейне. Не заменяй это на 'водную полосу', 'водный полюс', 'водную станцию' и другие искажения."
    );
  }

  return hints.join(" ");
}

function buildPrompt(child: ChildProfile, request: StoryInput) {
  const plotMode =
    request.mode === "guided"
      ? `Ситуация дня: ${request.situation}.`
      : "Сюжет придумай сам, но он должен быть цельным, интересным и не шаблонным.";

  return [
    "Ты сильный детский писатель русскоязычных сказок для вечернего чтения.",
    "Тебе нельзя писать краткую справку о ребенке или пересказ анкеты.",
    "Нужна полноценная художественная сказка, где действие начинается сразу, а не с описания кто такой ребенок.",
    "Пиши мягко, образно, тепло и по-настоящему увлекательно.",
    "Запрещены медицинские, клинические и психотерапевтические формулировки.",
    "Ребенок должен быть важной частью истории: главным героем, одним из центральных героев или тем, вокруг кого развивается сюжет.",
    "Не искажай слова и выражения из анкеты ребенка.",
    "Интересы ребенка должны быть встроены в сюжет, а не перечислены отдельно.",
    "Если указаны дополнительные персонажи, они должны участвовать в развитии истории.",
    "Нужен понятный сюжет с завязкой, развитием, препятствием, добрым преодолением и спокойным финалом.",
    "Сюжет должен быть понятным обычному ребенку и взрослому без странных абстракций.",
    "Не вводи сюрреалистические сущности, резкие нелогичные повороты и случайные метафоры, если об этом не просили.",
    "Все образы должны быть простыми, ясными и естественными для детской сказки.",
    `Имя ребенка: ${child.name}.`,
    `Возраст: ${child.age}.`,
    `Интересы: ${child.interests || "не указаны"}.`,
    buildInterestGuidance(child.interests),
    `Страхи: ${child.fears || "не указаны"}.`,
    `Дополнительный контекст: ${child.additional_context || "не указан"}.`,
    `Длительность чтения: около ${request.durationMinutes} минут.`,
    `Целевая длина: ${getTargetLength(request.durationMinutes)}.`,
    `Место действия: ${request.setting}.`,
    `Цель сказки: ${request.goal}.`,
    `Настроение сказки: ${request.tone}.`,
    `Дополнительные персонажи: ${request.characters || "придумай сам, если это уместно"}.`,
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
    ? `всё было связано с тем, что ${child.name.toLowerCase()} очень любит ${child.interests}`
    : `вокруг происходило нечто необычное`;

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
      : `${child.name} и тайна места "${request.setting}"`;

  const intro = `${child.name} уже почти собирался ко сну, когда в ${request.setting} всё вокруг будто чуть-чуть замерцало и подсказало: сегодня начинается особенная история. ${child.name} сразу почувствовал, что рядом произойдет что-то важное именно для него. Воздух был ${request.tone}, а вокруг словно специально оживали детали, которые ребенок любит больше всего.`;
  const interests = child.interests
    ? `Совсем не случайно рядом оказались именно те вещи и образы, которые радуют ${child.name.toLowerCase()}: ${child.interests}. Они не просто украшали путь, а подсказывали, как смотреть на происходящее смелее и спокойнее.`
    : `${child.name} замечал вокруг всё самое красивое и интересное, и это постепенно делало его смелее.`;
  const conflict = `Но вместе с этой красотой пришла и трудность: ${situation}. Сначала ${child.name.toLowerCase()} немного растерялся, потому что такие моменты редко решаются сразу. Внутри хотелось то спрятаться, то обидеться, то просто сделать вид, что ничего не происходит.`;
  const companionScene = `Именно тогда рядом появился ${companion}. Он не стал читать нотации и не говорил слишком умных слов. Вместо этого он предложил остановиться, оглядеться и понять, что чувствует сердце, когда день оказался труднее, чем хотелось.`;
  const fearScene = child.fears
    ? `${companion} мягко напомнил, что даже если иногда рядом ходят страхи вроде "${child.fears}", они не делают ${child.name.toLowerCase()} слабым. Наоборот, они помогают заметить, где особенно нужна поддержка, добрый разговор и маленький смелый шаг.`
    : `${companion} мягко напомнил, что тревога уходит быстрее, если разбить большую трудность на маленькие понятные шаги.`;
  const growthScene = `Тогда ${child.name.toLowerCase()} сделал первое важное действие: глубоко вдохнул, посмотрел на ситуацию по-новому и решил не убегать от нее. Потом появился второй шаг, а за ним и третий. Постепенно история перестала быть страшной или обидной и превратилась в настоящее приключение, где можно быть добрым, сильным и внимательным.`;
  const goalScene = `Именно так в этой истории проявилась главная тема — ${request.goal}. ${child.name} понял, что важные перемены редко приходят громко. Чаще они случаются в тот момент, когда ребенок вдруг сам выбирает более теплый, честный и спокойный способ поступить.`;
  const resolution = `Когда всё закончилось, ${child.name.toLowerCase()} уже чувствовал себя совсем иначе. Мир вокруг в ${request.setting} словно стал мягче, тише и дружелюбнее. Даже ${companion} улыбнулся так, будто заранее знал: у этой сказки обязательно будет хороший конец.`;
  const bedtime = `Перед сном ${child.name.toLowerCase()} еще немного посидел в тишине и понял, что день подарил ему не только историю, но и внутреннюю опору. Если завтра снова случится что-то непростое, внутри уже останется память о сегодняшнем пути, о добром спутнике и о том, что любое большое чувство можно прожить бережно. А потом глаза сами начали закрываться, потому что сердце стало спокойным, тёплым и лёгким.`;

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
      temperature: 0.65,
      messages: [
        {
          role: "system",
          content:
            "Ты пишешь сильные русскоязычные сказки для детей и умеешь делать их теплыми, длинными и небанальными."
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
