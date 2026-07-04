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
  premise: z.string().trim().min(5, "Коротко опишите героев и основную идею").max(600)
});

export async function createSeries(
  _prevState: SeriesActionState,
  formData: FormData
): Promise<SeriesActionState> {
  const user = await requireUser();
  await ensureUserProfile(user.id, user.email);

  const parsed = seriesSchema.safeParse({
    childId: formData.get("childId"),
    title: formData.get("title"),
    premise: formData.get("premise")
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
      premise: parsed.data.premise
    })
    .select("id")
    .single();

  if (error || !series) {
    console.error("createSeries error", error);
    return { error: "Не удалось создать сериал. Проверьте, применена ли миграция базы." };
  }

  redirect(`/series/${series.id}`);
}
