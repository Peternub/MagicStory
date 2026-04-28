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

function buildStorySummary(input: {
  situation?: string;
  goal: string;
  setting: string;
  durationMinutes: number;
}) {
  return `${input.situation}. ${input.durationMinutes} мин, цель: ${input.goal}, место: ${input.setting}`;
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
    .select("id, name, age, gender")
    .eq("id", parsed.data.childId)
    .eq("user_id", user.id)
    .single();

  if (isMissingColumnError(childError, "gender")) {
    const fallbackChild = await supabase
      .from("children")
      .select("id, name, age")
      .eq("id", parsed.data.childId)
      .eq("user_id", user.id)
      .single();

    child = fallbackChild.data
      ? {
          ...fallbackChild.data,
          gender: "boy" as const
        }
      : null;
    childError = fallbackChild.error;
  }

  if ((profile?.stories_balance ?? 0) <= 0) {
    return {
      error: "Лимит сказок закончился. Пополните пакет, чтобы создать новую сказку."
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

  const storySummary = buildStorySummary(parsed.data);

  const { data: storyRecord, error: insertError } = await supabase
    .from("stories")
    .insert({
      user_id: user.id,
      child_id: child.id,
      theme: storySummary,
      status: "text_generating"
    })
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
      error: "Не удалось создать запись сказки"
    };
  }

  try {
    const generated = await generateStory({
      child,
      request: parsed.data
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
      event_type: "story_created",
      amount: 1
    });
  } catch (storyError) {
    console.error("Story generation failed", storyError);

    await supabase
      .from("stories")
      .update({
        status: "failed",
        error_message: "Не удалось сгенерировать текст сказки"
      })
      .eq("id", storyRecord.id)
      .eq("user_id", user.id);

    return {
      error: "Не удалось создать сказку. Попробуйте еще раз."
    };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/stories");
  revalidatePath("/children");
  redirect(`/stories/${storyRecord.id}`);
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
    .select("id, text_content")
    .eq("id", storyId)
    .eq("user_id", user.id)
    .single();

  if (!story?.text_content) {
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
          contentType: "audio/ogg; codecs=opus",
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
          tts_error_message: status.errorMessage ?? "SaluteSpeech не смог озвучить сказку."
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
