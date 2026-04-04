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

export const storySchema = z
  .object({
    childId: z.string().uuid("Выберите ребенка"),
    mode: z.enum(["guided", "auto"], {
      message: "Выберите режим создания сказки"
    }),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(3, "Минимальная длительность — 3 минуты")
      .max(10, "Максимальная длительность — 10 минут"),
    situation: z.string().trim().max(500, "Ситуация слишком длинная").optional(),
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

export type StoryInput = z.infer<typeof storySchema>;
