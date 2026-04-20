import { z } from "zod";

const goals = [
  "спокойно уснуть",
  "стать смелее",
  "помириться и подружиться",
  "поверить в себя",
  "прожить день мягче"
] as const;

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
        message: "Коротко опишите, что произошло сегодня"
      });
    }
  });

export function parseStoryFormData(formData: FormData) {
  return storySchema.safeParse({
    childId: formData.get("childId"),
    durationMinutes: formData.get("durationMinutes"),
    situation: formData.get("situation"),
    setting: formData.get("setting"),
    goal: formData.get("goal"),
    extraWishes: formData.get("extraWishes")
  });
}

export type StoryInput = z.infer<typeof storySchema>;
