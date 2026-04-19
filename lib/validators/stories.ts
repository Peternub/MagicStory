import { z } from "zod";

const goals = [
  "спокойное засыпание",
  "смелость и уверенность",
  "доброта и дружба",
  "порядок и ответственность",
  "самостоятельность",
  "хорошее настроение"
] as const;

const tones = [
  "очень спокойная",
  "уютная",
  "приключенческая",
  "смешная и добрая"
] as const;

const childRoles = [
  "главный герой",
  "один из главных героев",
  "второстепенный герой",
  "вообще не участвует в сюжете"
] as const;

export const storySchema = z
  .object({
    childName: z
      .string()
      .trim()
      .min(2, "Укажите имя ребенка")
      .max(80, "Имя ребенка слишком длинное"),
    childAge: z.coerce
      .number()
      .int()
      .min(3, "Возраст должен быть не меньше 3 лет")
      .max(12, "Возраст должен быть не больше 12 лет"),
    childInterests: z
      .string()
      .trim()
      .max(200, "Интересы слишком длинные")
      .optional(),
    childFears: z
      .string()
      .trim()
      .max(200, "Страхи слишком длинные")
      .optional(),
    childContext: z
      .string()
      .trim()
      .max(300, "Контекст слишком длинный")
      .optional(),
    mode: z.enum(["guided", "auto"], {
      message: "Выберите режим создания сказки"
    }),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(3, "Минимальная длительность - 3 минуты")
      .max(10, "Максимальная длительность - 10 минут"),
    situation: z
      .string()
      .trim()
      .max(500, "Ситуация слишком длинная")
      .optional(),
    setting: z
      .string()
      .trim()
      .min(2, "Укажите место действия")
      .max(120, "Место действия слишком длинное"),
    goal: z.enum(goals, {
      message: "Выберите цель сказки"
    }),
    tone: z.enum(tones, {
      message: "Выберите настроение сказки"
    }),
    childRole: z.enum(childRoles, {
      message: "Выберите роль ребенка в сказке"
    }),
    characters: z
      .string()
      .trim()
      .max(200, "Список персонажей слишком длинный")
      .optional(),
    extraWishes: z
      .string()
      .trim()
      .max(400, "Дополнительные пожелания слишком длинные")
      .optional()
  })
  .superRefine((data, ctx) => {
    if (data.mode === "guided" && (!data.situation || data.situation.length < 10)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["situation"],
        message: "Опишите ситуацию дня хотя бы одной понятной фразой"
      });
    }
  });

export function parseStoryFormData(formData: FormData) {
  return storySchema.safeParse({
    childName: formData.get("childName"),
    childAge: formData.get("childAge"),
    childInterests: formData.get("childInterests"),
    childFears: formData.get("childFears"),
    childContext: formData.get("childContext"),
    mode: formData.get("mode"),
    durationMinutes: formData.get("durationMinutes"),
    situation: formData.get("situation"),
    setting: formData.get("setting"),
    goal: formData.get("goal"),
    tone: formData.get("tone"),
    childRole: formData.get("childRole"),
    characters: formData.get("characters"),
    extraWishes: formData.get("extraWishes")
  });
}

export type StoryInput = z.infer<typeof storySchema>;
