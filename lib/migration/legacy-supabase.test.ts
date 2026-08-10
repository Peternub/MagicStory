import { describe, expect, test } from "bun:test";

import {
  buildPlanMigrationFields,
  buildSeriesMigrationFields,
  buildStoryMigrationFields,
  mapLegacyStoryStatus
} from "@/lib/migration/legacy-supabase";

describe("преобразование старых данных Supabase", () => {
  test("переводит старые статусы историй", () => {
    expect(mapLegacyStoryStatus("text_generating")).toBe("generating");
    expect(mapLegacyStoryStatus("text_ready")).toBe("completed");
    expect(mapLegacyStoryStatus("audio_generating")).toBe("completed");
    expect(mapLegacyStoryStatus("completed")).toBe("completed");
  });

  test("восстанавливает количество эпизодов из старой метки", () => {
    const fields = buildSeriesMigrationFields(
      {
        id: "series-1",
        premise: "Приключение\n\n[MS_EPISODES:12]"
      },
      [{ series_id: "series-1", status: "completed" }]
    );

    expect(fields.planned_episodes).toBe(12);
    expect(fields.status).toBe("active");
  });

  test("помечает полностью готовую серию завершённой", () => {
    const stories = Array.from({ length: 8 }, () => ({
      series_id: "series-1",
      status: "completed"
    }));

    expect(
      buildSeriesMigrationFields(
        { id: "series-1", premise: "Серия без метки" },
        stories
      ).status
    ).toBe("completed");
  });

  test("не переносит удалённые поля озвучки в новую историю", () => {
    expect(buildStoryMigrationFields("completed")).toEqual({
      status: "completed",
      summary: null,
      generation_input: {},
      generation_key: null,
      generation_started_at: null
    });
  });

  test("назначает модель по коду тарифа", () => {
    expect(buildPlanMigrationFields("unlimited-plus")).toEqual({
      billing_period: "month",
      is_unlimited: true,
      model_code: "gpt-5.6-terra"
    });
    expect(buildPlanMigrationFields("unlimited-premium").model_code).toBe(
      "gpt-5.6-sol"
    );
  });
});
