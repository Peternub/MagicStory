"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureUserProfile } from "@/lib/account/ensure-profile";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SeriesActionState = {
  error?: string;
};

const seriesSchema = z.object({
  childId: z.string().uuid("Выберите ребенка"),
  title: z.string().trim().min(2, "Напишите название сериала").max(120),
  premise: z.string().trim().min(5, "Коротко опишите героев и основную идею").max(600),
  setting: z.string().trim().max(220).optional(),
  mainCharacters: z.string().trim().max(400).optional(),
  eveningGoal: z.string().trim().max(320).optional(),
  parentRules: z.string().trim().max(400).optional()
});

function cleanOptional(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function buildSeriesPremise(input: z.infer<typeof seriesSchema>) {
  return [
    `Основная идея: ${input.premise}`,
    input.setting ? `Мир и места: ${input.setting}` : null,
    input.mainCharacters ? `Постоянные герои: ${input.mainCharacters}` : null,
    input.eveningGoal ? `Задача сериала для вечера: ${input.eveningGoal}` : null,
    input.parentRules ? `Что учитывать и чего избегать: ${input.parentRules}` : null,
    "Формат: каждая новая серия создается одной кнопкой, продолжает общий сюжет, мягко закрывает вечер и оставляет спокойный повод вернуться завтра."
  ]
    .filter(Boolean)
    .join("\n");
}

export async function createSeries(
  _prevState: SeriesActionState,
  formData: FormData
): Promise<SeriesActionState> {
  const user = await requireUser();
  await ensureUserProfile(user.id, user.email);

  const parsed = seriesSchema.safeParse({
    childId: formData.get("childId"),
    title: formData.get("title"),
    premise: formData.get("premise"),
    setting: cleanOptional(formData.get("setting")),
    mainCharacters: cleanOptional(formData.get("mainCharacters")),
    eveningGoal: cleanOptional(formData.get("eveningGoal")),
    parentRules: cleanOptional(formData.get("parentRules"))
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте данные сериала" };
  }

  const supabase = createSupabaseAdminClient();
  const { data: child } = await supabase
    .from("children")
    .select("id")
    .eq("id", parsed.data.childId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!child) {
    return { error: "Профиль ребенка не найден" };
  }

  const { data: series, error } = await supabase
    .from("story_series")
    .insert({
      user_id: user.id,
      child_id: child.id,
      title: parsed.data.title,
      premise: buildSeriesPremise(parsed.data)
    })
    .select("id")
    .single();

  if (error || !series) {
    console.error("createSeries error", error);
    return { error: "Не удалось создать сериал. Проверьте, применена ли миграция базы." };
  }

  redirect(`/series/${series.id}`);
}
