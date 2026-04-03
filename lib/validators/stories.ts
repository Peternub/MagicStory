import { z } from "zod";

export const storySchema = z.object({
  childId: z.string().uuid("Выберите ребенка"),
  theme: z
    .string()
    .trim()
    .min(5, "Тема должна содержать минимум 5 символов")
    .max(300, "Тема слишком длинная")
});

export type StoryInput = z.infer<typeof storySchema>;
