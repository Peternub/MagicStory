import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(120),
  email: z.string().email("Введите корректный email"),
  message: z.string().trim().min(10, "Сообщение слишком короткое").max(2000)
});
