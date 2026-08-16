import { describe, expect, test } from "bun:test";
import {
  declineRussianName,
  StoryPseudonymizer,
  type NameForms,
  type PersonGender
} from "@/lib/ai/pseudonymization";

const cases: Array<[string, PersonGender, NameForms]> = [
  ["Миша", "male", { NOM: "Миша", GEN: "Миши", DAT: "Мише", ACC: "Мишу", INS: "Мишой", PREP: "Мише" }],
  ["Максим", "male", { NOM: "Максим", GEN: "Максима", DAT: "Максиму", ACC: "Максима", INS: "Максимом", PREP: "Максиме" }],
  ["Лев", "male", { NOM: "Лев", GEN: "Льва", DAT: "Льву", ACC: "Льва", INS: "Львом", PREP: "Льве" }],
  ["Илья", "male", { NOM: "Илья", GEN: "Ильи", DAT: "Илье", ACC: "Илью", INS: "Ильёй", PREP: "Илье" }],
  ["Никита", "male", { NOM: "Никита", GEN: "Никиты", DAT: "Никите", ACC: "Никиту", INS: "Никитой", PREP: "Никите" }],
  ["Мария", "female", { NOM: "Мария", GEN: "Марии", DAT: "Марии", ACC: "Марию", INS: "Марией", PREP: "Марии" }],
  ["София", "female", { NOM: "София", GEN: "Софии", DAT: "Софии", ACC: "Софию", INS: "Софией", PREP: "Софии" }]
];

describe("склонение русских имён", () => {
  for (const [name, gender, expected] of cases) {
    test(`склоняет ${name} без замены формы имени`, () => {
      expect(declineRussianName(name, gender)).toEqual(expected);
    });
  }
});

describe("StoryPseudonymizer", () => {
  test("маскирует и восстанавливает падежи ребёнка и друзей", () => {
    const pseudonymizer = new StoryPseudonymizer();
    pseudonymizer.registerChildName("Миша", "male");
    pseudonymizer.scan("подруга София ждала Мишу");

    const masked = pseudonymizer.mask(
      "Миша открыл дверь. Бабушка улыбнулась Мише. Подарок для Миши. Подруга София ждала Мишу."
    );

    expect(masked).toContain("{{CHILD_NOM}} открыл дверь");
    expect(masked).toContain("{{CHILD_DAT}}");
    expect(masked).toContain("{{CHILD_GEN}}");
    expect(masked).toContain("{{PERSON_1_NOM}}");
    expect(masked).not.toContain("Миша");
    expect(masked).not.toContain("София");
    expect(pseudonymizer.restore(masked)).toBe(
      "Миша открыл дверь. Бабушка улыбнулась Мише. Подарок для Миши. Подруга София ждала Мишу."
    );
  });

  test("не регистрирует падежную форму ребёнка как нового персонажа", () => {
    const pseudonymizer = new StoryPseudonymizer();
    pseudonymizer.registerChildName("Захар", "male");
    pseudonymizer.scan("Мама Ольга встретила Захара");

    expect(Object.keys(pseudonymizer.toJSON()).filter((key) => key.startsWith("{{PERSON_")).length).toBe(6);
  });

  test("маскирует память сериала и восстанавливает её только в Москве", () => {
    const pseudonymizer = new StoryPseudonymizer();
    pseudonymizer.registerChildName("Мария", "female");
    const memory = {
      characters: ["Мария — главная героиня"],
      facts: ["У Марии есть фонарь"],
      open_threads: ["Письмо для Марии"],
      episode_summaries: ["Мария нашла ключ"]
    };
    pseudonymizer.scanMemory(memory);
    const masked = pseudonymizer.maskMemory(memory);

    expect(JSON.stringify(masked)).not.toContain("Мария");
    expect(JSON.stringify(masked)).not.toContain("Марии");
    expect(pseudonymizer.restoreMemory(masked)).toEqual(memory);
  });

  test("блокирует прямые идентификаторы перед gateway", () => {
    const pseudonymizer = new StoryPseudonymizer();
    let errorMessage = "";
    try {
      pseudonymizer.assertSafeOutbound("Написать test@example.com");
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }
    expect(errorMessage).toBe("PERSONAL_IDENTIFIER_DETECTED");
  });

  test("не принимает часть обычного слова за раскрытое имя", () => {
    const pseudonymizer = new StoryPseudonymizer();
    pseudonymizer.registerChildName("Лев", "male");

    pseudonymizer.assertSafeOutbound("Слева горел левый фонарь.");

    let errorMessage = "";
    try {
      pseudonymizer.assertSafeOutbound("Лев увидел фонарь.");
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }

    expect(errorMessage).toBe("UNMASKED_PRIVATE_NAME_DETECTED");
  });
});
