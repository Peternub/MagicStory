import { z } from "zod";

export const childSchema = z.object({
  name: z.string().trim().min(1, "Введите имя ребенка").max(100),
  age: z.coerce
    .number()
    .int("Возраст должен быть целым числом")
    .min(3, "Минимальный возраст — 3 года")
    .max(10, "Максимальный возраст — 10 лет"),
  interests: z.string().trim().max(500).optional(),
  fears: z.string().trim().max(500).optional(),
  additional_context: z.string().trim().max(1000).optional()
});

export type ChildInput = z.infer<typeof childSchema>;
