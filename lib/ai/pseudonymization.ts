export type PrivateAliases = Record<string, string>;

export function parsePrivateAliases(value: unknown): PrivateAliases {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([placeholder, original]) =>
          /^\{\{(?:CHILD_NAME|PERSON_[0-9]+)\}\}$/.test(placeholder) &&
          typeof original === "string" &&
          original.length > 0 &&
          original.length <= 100
      )
      .slice(0, 50)
  );
}

const SAFE_CAPITALIZED_WORDS = new Set([
  "Автопродолжение",
  "Бабушка",
  "Брат",
  "Возраст",
  "Главная",
  "Данные",
  "Дополнительные",
  "Друзья",
  "Дедушка",
  "Интересы",
  "Место",
  "Мама",
  "Мир",
  "Основная",
  "Паспорт",
  "Папа",
  "Пол",
  "Постоянные",
  "Профиль",
  "Родитель",
  "Сестра",
  "Сериал",
  "Серия",
  "Сегодня",
  "Страхи",
  "Это",
  "Формат"
]);

const RELATION_NAME_PATTERN =
  /(?:мама|папа|бабушка|дедушка|брат|сестра|друг|подруга|няня|кот|кошка|пёс|собака|питомец)\s+([а-яёa-z][а-яёa-z-]{1,30})/giu;
const CAPITALIZED_WORD_PATTERN = /(?<![\p{L}\p{N}_])[А-ЯЁ][а-яё]+(?:-[А-ЯЁ][а-яё]+)?(?![\p{L}\p{N}_])/gu;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceWholeValue(text: string, value: string, replacement: string) {
  return text.replace(
    new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegExp(value)}(?![\\p{L}\\p{N}_])`, "giu"),
    replacement
  );
}

export class StoryPseudonymizer {
  private readonly aliases: PrivateAliases;

  constructor(existingAliases: PrivateAliases = {}) {
    this.aliases = parsePrivateAliases(existingAliases);
  }

  registerChildName(name: string) {
    const normalized = name.trim();
    if (normalized) {
      this.aliases["{{CHILD_NAME}}"] = normalized;
    }
  }

  scan(text: string | null | undefined) {
    if (!text) {
      return;
    }

    for (const match of text.matchAll(RELATION_NAME_PATTERN)) {
      this.registerPerson(match[1]);
    }

    for (const match of text.matchAll(CAPITALIZED_WORD_PATTERN)) {
      if (!SAFE_CAPITALIZED_WORDS.has(match[0])) {
        this.registerPerson(match[0]);
      }
    }
  }

  mask(text: string | null | undefined) {
    if (!text) {
      return text ?? "";
    }

    return Object.entries(this.aliases)
      .sort(([, left], [, right]) => right.length - left.length)
      .reduce(
        (result, [placeholder, original]) => replaceWholeValue(result, original, placeholder),
        text
      );
  }

  restore(text: string) {
    return Object.entries(this.aliases).reduce(
      (result, [placeholder, original]) => result.replaceAll(placeholder, original),
      text
    );
  }

  toJSON(): PrivateAliases {
    return { ...this.aliases };
  }

  private registerPerson(value: string | undefined) {
    const normalized = value?.trim();
    if (!normalized) {
      return;
    }

    const known = Object.entries(this.aliases).find(
      ([, original]) => original.toLocaleLowerCase("ru-RU") === normalized.toLocaleLowerCase("ru-RU")
    );

    if (!known) {
      const personCount = Object.keys(this.aliases).filter((key) => key.startsWith("{{PERSON_")).length;
      this.aliases[`{{PERSON_${personCount + 1}}}`] = normalized;
    }
  }
}
