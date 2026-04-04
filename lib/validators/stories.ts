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

function parseCheckboxValue(value: FormDataEntryValue | null) {
  return value === "on" || value === "true" || value === "1";
}

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
    useProfileInterests: z.boolean(),
    useProfileFears: z.boolean(),
    useProfileContext: z.boolean(),
    storyInterests: z
      .string()
      .trim()
      .max(200, "Интересы для этой сказки слишком длинные")
      .optional(),
    storyContext: z
      .string()
      .trim()
      .max(300, "Контекст для этой сказки слишком длинный")
      .optional(),
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
    childId: formData.get("childId"),
    mode: formData.get("mode"),
    durationMinutes: formData.get("durationMinutes"),
    situation: formData.get("situation"),
    setting: formData.get("setting"),
    goal: formData.get("goal"),
    tone: formData.get("tone"),
    childRole: formData.get("childRole"),
    useProfileInterests: parseCheckboxValue(formData.get("useProfileInterests")),
    useProfileFears: parseCheckboxValue(formData.get("useProfileFears")),
    useProfileContext: parseCheckboxValue(formData.get("useProfileContext")),
    storyInterests: formData.get("storyInterests"),
    storyContext: formData.get("storyContext"),
    characters: formData.get("characters"),
    extraWishes: formData.get("extraWishes")
  });
}

export type StoryInput = z.infer<typeof storySchema>;
