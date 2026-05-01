import { z } from "zod";

export const storySchema = z
  .object({
    childId: z.string().uuid("Выберите ребенка"),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(3, "Минимальная длительность - 3 минуты")
      .max(10, "Максимальная длительность - 10 минут"),
    situation: z
      .string()
      .trim()
      .max(500, "Тема сказки слишком длинная")
      .optional(),
    setting: z
      .string()
      .trim()
      .min(2, "Укажите место действия")
      .max(120, "Место действия слишком длинное"),
    additionalCharacters: z
      .string()
      .trim()
      .max(300, "Дополнительные персонажи описаны слишком длинно")
      .optional(),
    goal: z
      .string()
      .trim()
      .min(3, "Напишите, что должна дать сказка")
      .max(400, "Мораль сказки слишком длинная"),
    extraWishes: z
      .string()
      .trim()
      .max(400, "Дополнительные пожелания слишком длинные")
      .optional()
  })
  .superRefine((data, ctx) => {
    if (!data.situation || data.situation.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["situation"],
        message: "Коротко опишите тему сказки"
      });
    }
  });

export function parseStoryFormData(formData: FormData) {
  return storySchema.safeParse({
    childId: formData.get("childId"),
    durationMinutes: formData.get("durationMinutes"),
    situation: formData.get("situation"),
    setting: formData.get("setting"),
    additionalCharacters: formData.get("additionalCharacters"),
    goal: formData.get("goal"),
    extraWishes: formData.get("extraWishes")
  });
}

export type StoryInput = z.infer<typeof storySchema>;
