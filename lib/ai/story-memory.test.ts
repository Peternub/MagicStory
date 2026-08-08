import { describe, expect, test } from "bun:test";
import { EMPTY_SERIES_MEMORY, parseSeriesMemory } from "@/lib/ai/story-memory";

describe("parseSeriesMemory", () => {
  test("принимает корректную память", () => {
    const memory = {
      characters: ["{{CHILD_NAME}} любит собирать карты"],
      facts: ["Домик стоит у леса"],
      open_threads: ["Найти ключ"],
      episode_summaries: ["Герои нашли карту"]
    };

    expect(parseSeriesMemory(memory)).toEqual(memory);
  });

  test("заменяет повреждённую память пустой", () => {
    expect(parseSeriesMemory({ characters: "ошибка" })).toEqual(EMPTY_SERIES_MEMORY);
  });
});
