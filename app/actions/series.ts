"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureUserProfile } from "@/lib/account/ensure-profile";
import { addSeriesEpisodePlan } from "@/lib/stories/series-plan";
import { getGenerationActionError, processStoryGeneration } from "@/lib/stories/generation";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SeriesActionState = {
  error?: string;
};

const seriesSchema = z.object({
  childId: z.string().uuid("Выберите ребенка"),
  title: z.string().trim().min(2, "Напишите название сериала").max(120),
  premise: z.string().trim().min(5, "Коротко опишите героев и основную идею").max(600),
  plannedEpisodes: z.coerce.number().int().refine(
    (value) => value === 3 || (value >= 8 && value <= 16),
    "Выберите доступное количество серий"
  ),
  setting: z.string().trim().max(220).optional(),
  mainCharacters: z.string().trim().max(400).optional(),
  additionalWishes: z.string().trim().max(400).optional(),
  creationKey: z.string().uuid("Обновите страницу и попробуйте снова"),
  generationKey: z.string().uuid("Обновите страницу и попробуйте снова")
});

function cleanOptional(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function buildSeriesPremise(input: z.infer<typeof seriesSchema>) {
  return [
    `Основная идея: ${input.premise}`,
    input.setting ? `Мир и места: ${input.setting}` : null,
    input.mainCharacters ? `Постоянные герои: ${input.mainCharacters}` : null,
    input.additionalWishes ? `Дополнительные пожелания: ${input.additionalWishes}` : null,
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
    plannedEpisodes: formData.get("plannedEpisodes"),
    setting: cleanOptional(formData.get("setting")),
    mainCharacters: cleanOptional(formData.get("mainCharacters")),
    additionalWishes: cleanOptional(formData.get("additionalWishes")),
    creationKey: formData.get("creationKey"),
    generationKey: formData.get("generationKey")
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

  const premise = addSeriesEpisodePlan(buildSeriesPremise(parsed.data), parsed.data.plannedEpisodes);

  const { data: reservation, error } = await supabase.rpc(
    "create_series_with_first_episode",
    {
      episode_count: parsed.data.plannedEpisodes,
      series_premise: premise,
      series_title: parsed.data.title,
      target_child_id: child.id,
      target_creation_key: parsed.data.creationKey,
      target_generation_input: {},
      target_generation_key: parsed.data.generationKey,
      target_user_id: user.id,
      use_starter_offer: parsed.data.plannedEpisodes === 3
    }
  );
  const reserved = z
    .object({ series_id: z.string().uuid(), story_id: z.string().uuid() })
    .safeParse(reservation);

  if (error || !reserved.success) {
    if (error?.message.includes("STARTER_OFFER")) {
      return { error: "Разовый пакет не оплачен или уже использован." };
    }

    return { error: getGenerationActionError(error) };
  }

  try {
    await processStoryGeneration(user.id, reserved.data.story_id);
  } catch {
    // Сериал и первая серия сохранены; повтор доступен на странице сериала.
  }

  redirect(`/series/${reserved.data.series_id}`);
}
