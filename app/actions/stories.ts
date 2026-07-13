"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureUserProfile } from "@/lib/account/ensure-profile";
import { generateStory } from "@/lib/ai/generate-story";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isMissingColumnError } from "@/lib/supabase/errors";
import {
  downloadSaluteSpeechResult,
  getSaluteSpeechTaskStatus,
  startSaluteSpeechSynthesis
} from "@/lib/tts/salutespeech";
import { parseStoryFormData } from "@/lib/validators/stories";

type StoryActionState = {
  error?: string;
};

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

function buildStorySummary(input: {
  situation?: string;
  goal: string;
  setting: string;
  durationMinutes: number;
  additionalCharacters?: string;
}) {
  const characters = input.additionalCharacters
    ? `, персонажи: ${input.additionalCharacters}`
    : "";
  return `${input.situation}. ${input.durationMinutes} мин, изменение к финалу: ${input.goal}, место: ${input.setting}${characters}`;
}

async function saveReadyStoryAudio(input: {
  supabase: SupabaseAdminClient;
  userId: string;
  storyId: string;
  taskId: string;
}) {
  const status = await getSaluteSpeechTaskStatus(input.taskId);

  if (status.status === "DONE" && status.responseFileId) {
    const audio = await downloadSaluteSpeechResult(status.responseFileId);
    const audioPath = `${input.userId}/${input.storyId}.ogg`;
    const { error: uploadError } = await input.supabase.storage
      .from("story-audio")
      .upload(audioPath, audio, {
        contentType: "audio/ogg",
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    await input.supabase
      .from("stories")
      .update({
        audio_path: audioPath,
        tts_response_file_id: status.responseFileId,
        tts_status: "completed",
        tts_error_message: null
      })
      .eq("id", input.storyId)
      .eq("user_id", input.userId);

    return;
  }

  if (status.status === "ERROR" || status.status === "CANCELED") {
    await input.supabase
      .from("stories")
      .update({
        tts_status: "failed",
        tts_error_message: status.errorMessage ?? "SaluteSpeech не смог озвучить серию."
      })
      .eq("id", input.storyId)
      .eq("user_id", input.userId);

    return;
  }

  await input.supabase
    .from("stories")
    .update({
      tts_status: "audio_generating",
      tts_error_message: null
    })
    .eq("id", input.storyId)
    .eq("user_id", input.userId);
}

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
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stories_balance")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("createStory profile error", {
      userId: user.id,
      message: profileError.message,
      code: profileError.code,
      details: profileError.details,
      hint: profileError.hint
    });
  }

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

  if ((profile?.stories_balance ?? 0) <= 0) {
    return {
      error: "Лимит серий закончился. Пополните пакет, чтобы создать новую серию."
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
  const seriesId = typeof rawSeriesId === "string" && rawSeriesId ? rawSeriesId : null;
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

    episodeNumber = (previousEpisode?.episode_number ?? 0) + 1;
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
      extraWishes: [`ПАСПОРТ СЕРИАЛА «${series.title}»:`, series.premise, continuity].join("\n\n")
    };
  }

  const storySummary = seriesId
    ? `Серия ${episodeNumber}: ${storyRequest.situation}`
    : buildStorySummary(storyRequest);
  const storyInsert = {
    user_id: user.id,
    child_id: child.id,
    theme: storySummary,
    status: "text_generating",
    ...(seriesId
      ? {
          series_id: seriesId,
          episode_number: episodeNumber
        }
      : {})
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

    const { error: balanceError } = await supabase
      .from("profiles")
      .update({
        stories_balance: Math.max((profile?.stories_balance ?? 0) - 1, 0)
      })
      .eq("id", user.id);

    if (balanceError) {
      throw balanceError;
    }

    await supabase.from("usage_events").insert({
      user_id: user.id,
      story_id: storyRecord.id,
      event_type: seriesId ? "series_episode_created" : "story_created",
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
  if (seriesId) {
    revalidatePath(`/series/${seriesId}`);
  }
  revalidatePath("/children");
  redirect(seriesId ? `/series/${seriesId}` : `/stories/${storyRecord.id}`);
}

export async function deleteStory(formData: FormData) {
  const user = await requireUser();
  const storyId = formData.get("storyId");

  if (typeof storyId !== "string" || !storyId) {
    return;
  }

  const supabase = await createSupabaseServerClient();

  await supabase
    .from("stories")
    .delete()
    .eq("id", storyId)
    .eq("user_id", user.id);

  revalidatePath("/stories");
  revalidatePath("/dashboard");
  redirect("/stories");
}

export async function startStoryAudio(formData: FormData) {
  const user = await requireUser();
  const storyId = formData.get("storyId");

  if (typeof storyId !== "string" || !storyId) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { data: story } = await supabase
    .from("stories")
    .select("id, text_content, tts_task_id")
    .eq("id", storyId)
    .eq("user_id", user.id)
    .single();

  if (!story?.text_content) {
    redirect(`/stories/${storyId}`);
  }

  if (story.tts_task_id) {
    try {
      await saveReadyStoryAudio({
        supabase,
        userId: user.id,
        storyId,
        taskId: story.tts_task_id
      });
    } catch (error) {
      console.error("SaluteSpeech resume failed", error);

      await supabase
        .from("stories")
        .update({
          tts_status: "failed",
          tts_error_message: "Не удалось получить готовую озвучку. Попробуйте ещё раз."
        })
        .eq("id", storyId)
        .eq("user_id", user.id);
    }

    revalidatePath(`/stories/${storyId}`);
    redirect(`/stories/${storyId}`);
  }

  try {
    const synthesis = await startSaluteSpeechSynthesis(story.text_content);

    await supabase
      .from("stories")
      .update({
        provider_tts: synthesis.provider,
        tts_task_id: synthesis.taskId,
        tts_status: "audio_generating",
        tts_error_message: null
      })
      .eq("id", storyId)
      .eq("user_id", user.id);
  } catch (error) {
    console.error("SaluteSpeech start failed", error);

    await supabase
      .from("stories")
      .update({
        tts_status: "failed",
        tts_error_message: "Не удалось запустить озвучку. Проверьте настройки SaluteSpeech."
      })
      .eq("id", storyId)
      .eq("user_id", user.id);
  }

  revalidatePath(`/stories/${storyId}`);
  redirect(`/stories/${storyId}`);
}

export async function refreshStoryAudio(formData: FormData) {
  const user = await requireUser();
  const storyId = formData.get("storyId");

  if (typeof storyId !== "string" || !storyId) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { data: story } = await supabase
    .from("stories")
    .select("id, tts_task_id, provider_tts")
    .eq("id", storyId)
    .eq("user_id", user.id)
    .single();

  if (!story?.tts_task_id) {
    redirect(`/stories/${storyId}`);
  }

  try {
    const status = await getSaluteSpeechTaskStatus(story.tts_task_id);

    if (status.status === "DONE" && status.responseFileId) {
      const audio = await downloadSaluteSpeechResult(status.responseFileId);
      const audioPath = `${user.id}/${storyId}.ogg`;
      const { error: uploadError } = await supabase.storage
        .from("story-audio")
        .upload(audioPath, audio, {
          contentType: "audio/ogg",
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      await supabase
        .from("stories")
        .update({
          audio_path: audioPath,
          tts_response_file_id: status.responseFileId,
          tts_status: "completed",
          tts_error_message: null
        })
        .eq("id", storyId)
        .eq("user_id", user.id);
    } else if (status.status === "ERROR" || status.status === "CANCELED") {
      await supabase
        .from("stories")
        .update({
          tts_status: "failed",
          tts_error_message: status.errorMessage ?? "SaluteSpeech не смог озвучить серию."
        })
        .eq("id", storyId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("stories")
        .update({
          tts_status: "audio_generating",
          tts_error_message: null
        })
        .eq("id", storyId)
        .eq("user_id", user.id);
    }
  } catch (error) {
    console.error("SaluteSpeech refresh failed", error);

    await supabase
      .from("stories")
      .update({
        tts_status: "failed",
        tts_error_message: "Не удалось проверить озвучку. Попробуйте позже."
      })
      .eq("id", storyId)
      .eq("user_id", user.id);
  }

  revalidatePath(`/stories/${storyId}`);
  redirect(`/stories/${storyId}`);
}
