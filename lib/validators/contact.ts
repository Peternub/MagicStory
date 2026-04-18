import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(120),
  contact: z
    .string()
    .trim()
    .min(4, "Укажите, как с вами связаться")
    .max(160, "Контакт слишком длинный"),
  message: z.string().trim().min(10, "Сообщение слишком короткое").max(2000)
});
