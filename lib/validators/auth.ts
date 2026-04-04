import { z } from "zod";

const emailSchema = z.string().email("Введите корректный email");
const passwordSchema = z
  .string()
  .min(8, "Пароль должен содержать минимум 8 символов");
const nameSchema = z
  .string()
  .trim()
  .min(2, "Введите минимум 2 символа")
  .max(40, "Слишком длинное значение");

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const signUpSchema = signInSchema.extend({
  firstName: nameSchema,
  lastName: nameSchema
});
