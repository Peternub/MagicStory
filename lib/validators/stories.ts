import { z } from "zod";

export const storyModes = ["sleep", "situation", "adventure"] as const;

const modeDefaults: Record<
  (typeof storyModes)[number],
  { situation: string; setting: string; goal: string }
> = {
  sleep: {
    situation: "спокойная вечерняя история перед сном",
    setting: "дома перед сном",
    goal: "ребенок успокоился и с удовольствием лег спать"
  },
  situation: {
    situation: "событие, которое произошло с ребенком сегодня",
    setting: "в привычной обстановке ребенка",
    goal: "ребенок понял ситуацию и нашел спокойный способ с ней справиться"
  },
  adventure: {
    situation: "новое веселое приключение",
    setting: "в месте, которое подходит сюжету",
    goal: "ребенок приятно провел время и завершил приключение в спокойном настроении"
  }
};

const optionalText = (max: number, message: string) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max, message).optional()
  );

export const storySchema = z
  .object({
    childId: z.string().uuid("Выберите ребенка"),
    storyMode: z.enum(storyModes).default("sleep"),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(3, "Минимальная длительность - 3 минуты")
      .max(10, "Максимальная длительность - 10 минут")
      .default(5),
    situation: optionalText(500, "Описание дня слишком длинное"),
    setting: optionalText(120, "Место действия описано слишком подробно"),
    additionalCharacters: optionalText(300, "Список персонажей слишком длинный"),
    goal: optionalText(400, "Описание результата слишком длинное"),
    extraWishes: optionalText(400, "Дополнительные пожелания слишком длинные")
  })
  .transform((data) => {
    const defaults = modeDefaults[data.storyMode];

    return {
      ...data,
      situation: data.situation || defaults.situation,
      setting: data.setting || defaults.setting,
      goal: data.goal || defaults.goal
    };
  });

export function parseStoryFormData(formData: FormData) {
  return storySchema.safeParse({
    childId: formData.get("childId"),
    storyMode: formData.get("storyMode") || "sleep",
    durationMinutes: formData.get("durationMinutes") || 5,
    situation: formData.get("situation"),
    setting: formData.get("setting"),
    additionalCharacters: formData.get("additionalCharacters"),
    goal: formData.get("goal"),
    extraWishes: formData.get("extraWishes")
  });
}

export type StoryInput = z.infer<typeof storySchema>;
