import { z } from "zod";

export const childSchema = z.object({
  name: z.string().trim().min(1, "Введите имя ребенка").max(100),
  age: z.coerce
    .number()
    .int("Возраст должен быть целым числом")
    .min(3, "Минимальный возраст - 3 года")
    .max(12, "Максимальный возраст - 12 лет"),
  gender: z.enum(["boy", "girl"], {
    message: "Выберите пол ребенка"
  })
});

export type ChildInput = z.infer<typeof childSchema>;
