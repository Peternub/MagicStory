import "server-only";
import type { StoryInput } from "@/lib/validators/stories";

type ChildProfile = {
  name: string;
  age: number;
  gender: "boy" | "girl";
  interests?: string | null;
  fears?: string | null;
  additional_context?: string | null;
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
    case 4:
      return "3500-4000 слов";
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
      sat: "села",
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
    sat: "сел",
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

export function buildSeriesPrompt(child: ChildProfile, request: StoryInput) {
  return [
    "Ты пишешь детский персональный сериал на русском языке для вечернего чтения перед сном.",
    "Это не разовая сказка. Это одна серия большого семейного сериала, где ребенок каждый вечер возвращается к знакомым героям.",
    "",
    "ГЛАВНАЯ ЦЕЛЬ ПРОДУКТА:",
    "Родитель один раз задает данные о ребенке и сериале, а дальше каждый вечер нажимает одну кнопку. Поэтому серия должна сама продолжать общую историю, сохранять память сериала и не требовать новых настроек.",
    "",
    "СТИЛЬ:",
    "- живой, теплый, спокойный русский язык;",
    "- короткие и средние предложения;",
    "- конкретные действия в каждом абзаце;",
    "- бытовые детали, которые ребенок узнает;",
    "- мягкий юмор без шума и суеты;",
    "- диалоги звучат как обычный разговор ребенка и взрослого;",
    "- финал спокойный, сонный, безопасный.",
    "",
    "СТРОГО НЕЛЬЗЯ:",
    "- писать старинным сказочным языком;",
    "- начинать с 'жил-был';",
    "- читать мораль напрямую;",
    "- превращать текст в инструкцию для родителя;",
    "- использовать сложные психологические термины;",
    "- делать ребенка идеальным сразу;",
    "- делать взрослых лекторами;",
    "- пересказывать предыдущую серию целиком;",
    "- завершать серию жестким клиффхэнгером, который мешает уснуть.",
    "",
    "ПРАВИЛА СЕРИАЛА:",
    "1. Сохраняй постоянных героев, характер ребенка, привычные места и тон сериала.",
    "2. Если это первая серия, мягко представь мир и героев через действие, без длинного вступления.",
    "3. Если это продолжение, продолжай после предыдущей серии и используй только короткое естественное напоминание.",
    "4. У каждой серии должен быть маленький самостоятельный сюжет на вечер.",
    "5. В конце серия должна дать чувство завершения: стало спокойнее, понятнее или веселее.",
    "6. Оставь очень мягкий повод вернуться завтра: маленькая находка, план или обещание, но без тревоги.",
    "",
    "СТРУКТУРА СЕРИИ:",
    "1. Первая строка - короткий живой заголовок серии.",
    "2. Потом пустая строка.",
    "3. Затем 20-30 содержательных абзацев текста.",
    "4. Начни сразу со сцены, где герой что-то делает.",
    "5. Быстро введи сегодняшнее событие.",
    "6. Пусть ребенок пробует решить ситуацию по-детски: не идеально, иногда упрямо или смешно.",
    "7. Решение приходит через действие, разговор или маленький выбор.",
    "8. Заверши тихо и тепло, как текст перед сном.",
    "",
    "ПРОФИЛЬ РЕБЕНКА:",
    `Имя: ${child.name}.`,
    `Возраст: ${child.age}.`,
    `Пол: ${getGenderLabel(child.gender)}.`,
    `Интересы: ${child.interests || "не указаны"}.`,
    `Страхи или сложные ситуации: ${child.fears || "не указаны"}.`,
    `Друзья, семья, питомцы и важные детали: ${child.additional_context || "не указаны"}.`,
    "",
    "ДАННЫЕ СЕРИИ:",
    `Сегодняшнее событие или автопродолжение: ${request.situation}.`,
    `Место действия: ${request.setting}.`,
    `Дополнительные персонажи: ${request.additionalCharacters || "используй героев из паспорта сериала и профиля ребенка"}.`,
    `Что должно измениться к финалу: ${request.goal}.`,
    `Паспорт сериала, память и пожелания родителя: ${request.extraWishes || "нет дополнительных пожеланий"}.`,
    `Длительность чтения: около ${request.durationMinutes} минут.`,
    `Целевая длина: ${getTargetLength(request.durationMinutes)}.`,
    "Строго соблюдай целевую длину. Не сокращай серию ниже 3500 слов.",
    "",
    "ПРОВЕРКА ПЕРЕД ОТВЕТОМ:",
    "1. Это точно серия сериала, а не отдельная сказка?",
    "2. Есть ли связь с паспортом сериала и предыдущей серией?",
    "3. Родителю не придется ничего объяснять ребенку до чтения?",
    "4. В каждом абзаце что-то происходит?",
    "5. Финал спокойный и подходит перед сном?",
    "6. Есть ли мягкая причина вернуться к следующей серии завтра?",
    "",
    "ОТВЕТЬ ТОЛЬКО ТЕКСТОМ СЕРИИ: заголовок, пустая строка, затем сама серия."
  ].join("\n");
}

function parseStoryContent(content: string): Pick<GeneratedStory, "title" | "text"> {
  const normalized = content.trim();
  const [firstLine, ...rest] = normalized.split("\n");
  const title = firstLine.replace(/^#+\s*/, "").trim() || "Новая серия";
  const text = rest.join("\n").trim() || normalized;

  return { title, text };
}

function generateFallbackStory({
  child,
  request
}: GenerateStoryParams): GeneratedStory {
  const pronoun = getChildPronoun(child.gender);
  const words = getGenderedWords(child.gender);
  const title = `${child.name} и тихое продолжение`;
  const characters = request.additionalCharacters
    ? ` Рядом были: ${request.additionalCharacters}.`
    : "";

  const text = [
    `${child.name} ${words.sat} поудобнее и ${words.looked} туда, где вчера остановилась история. Сегодня все началось просто: ${request.situation}.${characters}`,
    `В ${request.setting} нашлась маленькая задача. Не огромная и не страшная, а такая, с которой сначала хочется спорить, потом подумать, а потом попробовать еще раз.`,
    `- Я пока не знаю, как это сделать, - ${words.said} ${child.name}. Голос получился немного сердитый, но совсем честный.`,
    `Взрослый рядом не стал читать лекцию. Он только спросил: - А какой самый маленький шаг можно сделать прямо сейчас? ${child.name} ${words.looked} вокруг и ${words.chose} начать с того, что было ближе всего.`,
    `${child.name} ${words.fixed} одну мелочь, потом другую. Сразу все не стало идеальным, зато внутри стало чуть тише. ${pronoun} ${words.noticed}, что маленькие шаги иногда работают лучше больших обещаний.`,
    request.extraWishes
      ? `Потом история вспомнила важные правила этого сериала: ${request.extraWishes.slice(0, 500)}. Все это осталось рядом, как знакомая тропинка, по которой легко идти вечером.`
      : `Потом герои договорились, что завтра можно будет продолжить с того же места. Ничего срочного. Просто будет интересно узнать, что получится дальше.`,
    `К концу серии ${child.name} ${words.settled} спокойнее и ${words.understood}, что ${pronoun} ${words.managed} по-своему: не идеально, зато честно и тепло. А завтра история тихонько продолжится.`
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
      temperature: 0.58,
      messages: [
        {
          role: "system",
          content:
            "Пиши теплые персональные детские сериалы на русском языке. Каждая генерация - это новая вечерняя серия с памятью, понятным сюжетом, спокойным финалом и мягким поводом продолжить завтра."
        },
        {
          role: "user",
          content: buildSeriesPrompt(params.child, params.request)
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
