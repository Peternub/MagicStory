"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureUserProfile } from "@/lib/account/ensure-profile";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SeriesActionState = {
  error?: string;
};

const quickIdeas = {
  magic: {
    premise: "волшебное приключение в знакомом мире, где ребёнок становится главным героем",
    title: (name: string) => `Волшебные приключения ${name}`
  },
  space: {
    premise: "космическое путешествие к новым планетам с добрыми открытиями и командной работой",
    title: (name: string) => `${name} среди звёзд`
  },
  mystery: {
    premise: "уютная тайна рядом с домом, которую ребёнок раскрывает вместе со знакомыми героями",
    title: (name: string) => `Тайна рядом с домом ${name}`
  },
  friendship: {
    premise: "история о дружбе, взаимопомощи и совместных приключениях ребёнка и его друзей",
    title: (name: string) => `${name} и настоящая дружба`
  }
} as const;

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.string().max(max).optional()
  );

const seriesSchema = z.object({
  childId: z.string().uuid("Выберите ребенка"),
  quickIdea: z.enum(["magic", "space", "mystery", "friendship"]).default("magic"),
  title: optionalText(120),
  premise: optionalText(600),
  setting: optionalText(220),
  mainCharacters: optionalText(400),
  additionalWishes: optionalText(400)
});

function cleanOptional(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function buildSeriesPremise(input: z.infer<typeof seriesSchema> & { premise: string }) {
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
    quickIdea: formData.get("quickIdea") || "magic",
    title: formData.get("title"),
    premise: formData.get("premise"),
    setting: cleanOptional(formData.get("setting")),
    mainCharacters: cleanOptional(formData.get("mainCharacters")),
    additionalWishes: cleanOptional(formData.get("additionalWishes"))
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте данные сериала" };
  }

  const supabase = createSupabaseAdminClient();
  const { data: child } = await supabase
    .from("children")
    .select("id, name")
    .eq("id", parsed.data.childId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!child) {
    return { error: "Профиль ребенка не найден" };
  }

  const selectedIdea = quickIdeas[parsed.data.quickIdea];
  const title = parsed.data.title ?? selectedIdea.title(child.name);
  const premise = parsed.data.premise ?? selectedIdea.premise;

  const { data: series, error } = await supabase
    .from("story_series")
    .insert({
      user_id: user.id,
      child_id: child.id,
      title,
      premise: buildSeriesPremise({ ...parsed.data, premise })
    })
    .select("id")
    .single();

  if (error || !series) {
    console.warn("Не удалось создать сериал", {
      code: error?.code,
      message: error?.message
    });

    if (error?.code === "42P01" || error?.code === "42703") {
      return { error: "База сериалов ещё не подключена." };
    }

    return { error: "Не удалось создать сериал. Попробуйте ещё раз." };
  }

  redirect(`/series/${series.id}`);
}
