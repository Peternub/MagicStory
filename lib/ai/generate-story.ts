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
      return "450-650 слов";
    case 5:
      return "700-950 слов";
    case 7:
      return "950-1250 слов";
    case 10:
      return "1300-1650 слов";
    default:
      return "700-950 слов";
  }
}

function getGenderLabel(gender: ChildProfile["gender"]) {
  return gender === "girl" ? "девочка" : "мальчик";
}

function getChildPronoun(gender: ChildProfile["gender"]) {
  return gender === "girl" ? "она" : "он";
}

function getGenderedWords(gender: ChildProfile["gender"]) {
  if (gender === "girl") {
    return {
      sat: "сидела",
      said: "сказала",
      looked: "посмотрела",
      fixed: "поправила",
      noticed: "заметила",
      chose: "выбрала",
      settled: "устроилась",
      understood: "поняла",
      managed: "справилась"
    };
  }

  return {
    sat: "сидел",
    said: "сказал",
    looked: "посмотрел",
    fixed: "поправил",
    noticed: "заметил",
    chose: "выбрал",
    settled: "устроился",
    understood: "понял",
    managed: "справился"
  };
}

function buildPrompt(child: ChildProfile, request: StoryInput) {
  return [
    "Ты пишешь детские рассказы-сказки на русском языке для вечернего чтения.",
    "Главная задача: сделать текст понятным, живым и близким ребенку, как будто историю рассказывает спокойный взрослый, который хорошо знает детей.",
    "Это должна быть не высокая волшебная сказка, а легкий рассказ-сказка из обычной детской жизни: дом, садик, школа, прогулка, игрушки, родители, друзья, смешные бытовые мелочи.",
    "Пиши простым языком. Короткие предложения. Живая речь. Больше конкретных действий и диалогов, меньше красивых описаний.",
    "Добавь 1-3 мягких смешных момента: не глупые шутки, а добрые детские ситуации, которые можно представить.",
    "Герой должен вести себя как настоящий ребенок: может спорить, путаться, отвлекаться, радоваться мелочам, задавать простые вопросы.",
    "Не делай текст назидательным. Никаких прямых уроков вроде 'и тогда он понял важную истину'. Пусть вывод чувствуется через события.",
    "Не используй сказочный пафос и туманные образы.",
    "Запрещено без прямой просьбы пользователя: волшебные фонарики, светлячки, говорящие предметы, сияющие тропинки, мудрые звери, феи, порталы, заклинания, чудесные лучи, 'маленькое чудо', 'сердце наполнилось светом'.",
    "Если нужен сказочный элемент, пусть он будет очень простым и бытовым: например, ребенок сам воображает игру, а не мир реально становится волшебным.",
    "Не используй канцелярит, терапевтические формулировки, медицинские советы и взрослые психологические объяснения.",
    `Имя ребенка: ${child.name}.`,
    `Возраст: ${child.age}.`,
    `Пол: ${getGenderLabel(child.gender)}.`,
    `Тема сказки: ${request.situation}.`,
    `Место действия: ${request.setting}.`,
    `Дополнительные персонажи: ${request.additionalCharacters || "без дополнительных персонажей"}.`,
    `Что должна дать сказка/мораль: ${request.goal}.`,
    `Дополнительные пожелания: ${request.extraWishes || "без дополнительных пожеланий"}.`,
    `Длительность чтения: около ${request.durationMinutes} минут.`,
    `Целевая длина: ${getTargetLength(request.durationMinutes)}.`,
    "Сделай заголовок на первой строке.",
    "После пустой строки дай сам текст.",
    "Текст должен состоять из 7-12 абзацев.",
    "Начни сразу с обычной живой сцены, без 'жил-был' и без длинного вступления.",
    "В каждом абзаце должно происходить что-то конкретное.",
    "Финал спокойный и теплый, но без сахарности: ребенку стало легче, понятнее или веселее."
  ].join("\n");
}

function parseStoryContent(content: string): Pick<GeneratedStory, "title" | "text"> {
  const normalized = content.trim();
  const [firstLine, ...rest] = normalized.split("\n");
  const title = firstLine.replace(/^#+\s*/, "").trim() || "Новая история";
  const text = rest.join("\n").trim() || normalized;

  return { title, text };
}

function generateFallbackStory({
  child,
  request
}: GenerateStoryParams): GeneratedStory {
  const pronoun = getChildPronoun(child.gender);
  const words = getGenderedWords(child.gender);
  const title = `${child.name} и день, который стал проще`;
  const characters = request.additionalCharacters
    ? ` Рядом в этой истории были: ${request.additionalCharacters}.`
    : "";

  const text = [
    `${child.name} ${words.sat} на краю кровати и смотрел${child.gender === "girl" ? "а" : ""} на носок, который почему-то никак не хотел надеваться ровно. Пятка торчала сбоку, как маленький бугорок, и это уже немного смешило. Тема сегодняшней истории была такая: ${request.situation}.${characters}`,
    `В ${request.setting} всё началось с обычной мелочи. Кто-то сказал не то, кто-то сделал не так, а у ${child.name} внутри будто накопился целый комок мыслей. Не огромный, конечно, но неприятный. Такой, который мешает спокойно играть и даже печенье делает каким-то не очень вкусным.`,
    `— Я вообще не знаю, что с этим делать, — ${words.said} ${child.name}. Голос получился сердитый, хотя сердиться уже немного надоело.`,
    `Рядом нашлась самая обычная вещь: подушка, карандаш, тапок или чашка с водой. Она не говорила и не светилась. Просто лежала рядом. ${child.name} ${words.looked} на нее и вдруг придумал игру: если мысль слишком липкая, ее можно представить как наклейку на руке. Наклейку трудно отлепить сразу, зато можно начать с уголка.`,
    `Первым уголком стало простое действие. ${child.name} ${words.fixed} носок. Потом сделал${child.gender === "girl" ? "а" : ""} маленький вдох. Потом сказал${child.gender === "girl" ? "а" : ""} одну короткую фразу про то, что должно стать понятнее: ${request.goal}. Фраза вышла не идеальная, зато своя.`,
    `После этого стало чуть легче. Не так, будто всё сразу стало прекрасно, а просто на один шаг спокойнее. ${child.name} даже ${words.noticed} смешную деталь: если очень серьезно хмуриться, брови устают первыми. От этого захотелось фыркнуть.`,
    request.extraWishes
      ? `Потом ${child.name} вспомнил${child.gender === "girl" ? "а" : ""} еще одну важную штуку: ${request.extraWishes}. Это не решило весь день за секунду, но помогло выбрать, что делать дальше.`
      : `Потом ${child.name} ${words.chose} самое простое: сделать дальше только один маленький шаг. Не весь день исправлять. Не всё сразу понимать. Только один шаг.`,
    `К вечеру история уже не казалась такой тяжелой. Она стала похожа на вещь, которую можно положить на полку и сказать: "Ладно, завтра разберемся дальше". ${child.name} ${words.settled} поудобнее и ${words.understood}, что ${pronoun} ${words.managed} по-своему: не идеально, зато честно и спокойно.`
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
      temperature: 0.62,
      messages: [
        {
          role: "system",
          content:
            "Ты пишешь простые, живые и понятные детям рассказы-сказки без сказочного пафоса, без лишней морали и без тяжелых метафор."
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
