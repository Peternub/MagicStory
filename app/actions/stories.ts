"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureUserProfile } from "@/lib/account/ensure-profile";
import { generateStory } from "@/lib/ai/generate-story";
import { getSeriesEpisodePlan, stripSeriesEpisodePlan } from "@/lib/stories/series-plan";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isMissingColumnError } from "@/lib/supabase/errors";
import { parseStoryFormData } from "@/lib/validators/stories";

type StoryActionState = {
  error?: string;
};

export async function createStory(
  _prevState: StoryActionState,
  formData: FormData
): Promise<StoryActionState> {
  const user = await requireUser();
  await ensureUserProfile(user.id, user.email);
  const parsed = parseStoryFormData(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные"
    };
  }

  const supabase = createSupabaseAdminClient();
  let { data: child, error: childError } = await supabase
    .from("children")
    .select("id, name, age, gender, interests, fears, additional_context")
    .eq("id", parsed.data.childId)
    .eq("user_id", user.id)
    .single();

  if (isMissingColumnError(childError, "gender")) {
    return {
      error: "В базе не применена миграция пола ребенка. Примените 20260420_006_add_child_gender.sql."
    };
  }

  if (childError || !child) {
    console.error("createStory child error", {
      userId: user.id,
      childId: parsed.data.childId,
      message: childError?.message,
      code: childError?.code,
      details: childError?.details,
      hint: childError?.hint
    });

    return {
      error: "Не удалось найти профиль ребенка"
    };
  }

  const rawSeriesId = formData.get("seriesId");
  const seriesId = typeof rawSeriesId === "string" ? rawSeriesId.trim() : "";

  if (!seriesId) {
    return { error: "Серию можно создать только внутри сериала" };
  }

  let episodeNumber: number | null = null;
  let storyRequest = parsed.data;

  if (seriesId) {
    const [{ data: series }, { data: previousEpisode }] = await Promise.all([
      supabase
        .from("story_series")
        .select("id, child_id, title, premise")
        .eq("id", seriesId)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("stories")
        .select("title, text_content, episode_number")
        .eq("series_id", seriesId)
        .eq("user_id", user.id)
        .order("episode_number", { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

    if (!series || series.child_id !== child.id) {
      return { error: "Сериал не найден" };
    }

    const nextEpisodeNumber = (previousEpisode?.episode_number ?? 0) + 1;
    if (nextEpisodeNumber > getSeriesEpisodePlan(series.premise)) {
      return { error: "Все запланированные серии уже созданы" };
    }
    episodeNumber = nextEpisodeNumber;

    const rawAddition = formData.get("situation");
    const addition = typeof rawAddition === "string" ? rawAddition.trim() : "";
    const continuity = previousEpisode?.text_content
      ? [
          `Это серия ${episodeNumber} сериала «${series.title}».`,
          "Продолжи сюжет напрямую, сохрани характеры героев, тон сериала и не пересказывай предыдущую серию.",
          addition
            ? `Сегодня родитель добавил событие для серии: ${addition}.`
            : "Родитель ничего не добавил сегодня. Сам придумай спокойное естественное продолжение из паспорта сериала и прошлой серии.",
          `Предыдущая серия «${previousEpisode.title ?? "Без названия"}»:`,
          previousEpisode.text_content.slice(-7000)
        ].join("\n\n")
      : [
          `Это первая серия сериала «${series.title}».`,
          "Представь постоянных героев через действие, задай уютный вечерний тон и оставь спокойную возможность для продолжения.",
          addition
            ? `Начальное событие от родителя: ${addition}.`
            : "Родитель не добавил отдельное событие. Начни с основной идеи сериала."
        ].join("\n\n");

    storyRequest = {
      ...parsed.data,
      situation: addition || "автоматическое продолжение сериала на сегодняшний вечер",
      setting: `мир сериала «${series.title}»`,
      goal: "завершить сегодняшнюю серию спокойно и оставить небольшой повод для следующей серии",
      extraWishes: [`ПАСПОРТ СЕРИАЛА «${series.title}»:`, stripSeriesEpisodePlan(series.premise), continuity].join("\n\n")
    };
  }

  const storySummary = `Серия ${episodeNumber}: ${storyRequest.situation}`;
  const storyInsert = {
    user_id: user.id,
    child_id: child.id,
    theme: storySummary,
    status: "generating",
    series_id: seriesId,
    episode_number: episodeNumber
  };

  const { data: storyRecord, error: insertError } = await supabase
    .from("stories")
    .insert(storyInsert)
    .select("id")
    .single();

  if (insertError || !storyRecord) {
    console.error("createStory insert error", {
      userId: user.id,
      childId: child.id,
      message: insertError?.message,
      code: insertError?.code,
      details: insertError?.details,
      hint: insertError?.hint
    });

    return {
      error: "Не удалось создать запись серии"
    };
  }

  try {
    const generated = await generateStory({
      child,
      request: storyRequest
    });

    const { error: storyUpdateError } = await supabase
      .from("stories")
      .update({
        title: generated.title,
        text_content: generated.text,
        provider_llm: generated.provider,
        status: "completed",
        error_message: null
      })
      .eq("id", storyRecord.id)
      .eq("user_id", user.id);

    if (storyUpdateError) {
      throw storyUpdateError;
    }

    await supabase.from("usage_events").insert({
      user_id: user.id,
      story_id: storyRecord.id,
      event_type: "series_episode_created",
      amount: 1
    });
  } catch (storyError) {
    console.error("Story generation failed", storyError);

    await supabase
      .from("stories")
      .update({
        status: "failed",
        error_message: "Не удалось сгенерировать текст серии"
      })
      .eq("id", storyRecord.id)
      .eq("user_id", user.id);

    return {
      error: "Не удалось создать серию. Попробуйте еще раз."
    };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/stories");
  revalidatePath("/series");
  revalidatePath(`/series/${seriesId}`);
  revalidatePath("/children");
  redirect(`/series/${seriesId}`);
}
