import { describe, expect, test } from "bun:test";
import { StoryPseudonymizer } from "@/lib/ai/pseudonymization";

describe("StoryPseudonymizer", () => {
  test("скрывает имена ребёнка и близких, затем восстанавливает текст", () => {
    const pseudonymizer = new StoryPseudonymizer();
    pseudonymizer.registerChildName("Захар");
    pseudonymizer.scan("Мама Ольга и друг Петя встретили Захара");

    const masked = pseudonymizer.mask("Мама Ольга и друг Петя встретили Захара");

    expect(masked).toMatch(/^Мама \{\{PERSON_1\}\} и друг \{\{PERSON_2\}\} встретили \{\{PERSON_3\}\}$/);
    expect(masked).not.toContain("Ольга");
    expect(masked).not.toContain("Петя");
    expect(masked).not.toContain("Захар");
    expect(pseudonymizer.restore(masked)).toBe("Мама Ольга и друг Петя встретили Захара");
  });

  test("сохраняет номера существующих псевдонимов", () => {
    const pseudonymizer = new StoryPseudonymizer({
      "{{CHILD_NAME}}": "Маша",
      "{{PERSON_1}}": "Ирина"
    });
    pseudonymizer.scan("друг Саша");

    expect(pseudonymizer.toJSON()).toEqual({
      "{{CHILD_NAME}}": "Маша",
      "{{PERSON_1}}": "Ирина",
      "{{PERSON_2}}": "Саша"
    });
  });
});
