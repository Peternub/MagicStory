"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateStory } from "@/lib/ai/generate-story";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildStoryAudioPath, getStoryAudioBucket } from "@/lib/supabase/storage";
import { generateAudio } from "@/lib/tts/generate-audio";
import { storySchema } from "@/lib/validators/stories";

type StoryActionState = {
  error?: string;
};

export async function createStory(
  _prevState: StoryActionState,
  formData: FormData
): Promise<StoryActionState> {
  const user = await requireUser();
  const parsed = storySchema.safeParse({
    childId: formData.get("childId"),
    theme: formData.get("theme")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные"
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stories_balance")
    .eq("id", user.id)
    .single();

  if (!profile || profile.stories_balance <= 0) {
    return {
      error: "Баланс сказок закончился"
    };
  }

  const { data: child, error: childError } = await supabase
    .from("children")
    .select("id, user_id, name, age, interests, fears, additional_context")
    .eq("id", parsed.data.childId)
    .eq("user_id", user.id)
    .single();

  if (childError || !child) {
    return {
      error: "Не удалось найти профиль ребенка"
    };
  }

  const { data: storyRecord, error: insertError } = await supabase
    .from("stories")
    .insert({
      user_id: user.id,
      child_id: child.id,
      theme: parsed.data.theme,
      status: "text_generating"
    })
    .select("id")
    .single();

  if (insertError || !storyRecord) {
    return {
      error: "Не удалось создать запись сказки"
    };
  }

  try {
    const generated = await generateStory({
      child,
      theme: parsed.data.theme
    });

    const { error: updateError } = await supabase
      .from("stories")
      .update({
        title: generated.title,
        text_content: generated.text,
        provider_llm: generated.provider,
        status: "text_ready"
      })
      .eq("id", storyRecord.id)
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    await supabase
      .from("stories")
      .update({
        status: "audio_generating"
      })
      .eq("id", storyRecord.id)
      .eq("user_id", user.id);

    const generatedAudio = await generateAudio({
      text: generated.text
    });

    if (generatedAudio) {
      const adminClient = createSupabaseAdminClient();
      const audioPath = buildStoryAudioPath(user.id, storyRecord.id);
      const bucket = getStoryAudioBucket();

      const { error: uploadError } = await adminClient.storage
        .from(bucket)
        .upload(audioPath, generatedAudio.buffer, {
          contentType: generatedAudio.contentType,
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: completeError } = await supabase
        .from("stories")
        .update({
          audio_url: audioPath,
          provider_tts: generatedAudio.provider,
          status: "completed"
        })
        .eq("id", storyRecord.id)
        .eq("user_id", user.id);

      if (completeError) {
        throw completeError;
      }
    } else {
      await supabase
        .from("stories")
        .update({
          status: "text_ready"
        })
        .eq("id", storyRecord.id)
        .eq("user_id", user.id);
    }

    await supabase.from("usage_events").insert({
      user_id: user.id,
      story_id: storyRecord.id,
      event_type: "story_created",
      amount: -1
    });

    await supabase
      .from("profiles")
      .update({
        stories_balance: profile.stories_balance - 1
      })
      .eq("id", user.id);
  } catch {
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

  revalidatePath("/stories");
  revalidatePath("/dashboard");
  redirect(`/stories/${storyRecord.id}`);
}

export async function deleteStory(formData: FormData) {
  const user = await requireUser();
  const storyId = formData.get("storyId");

  if (typeof storyId !== "string" || !storyId) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();
  const bucket = getStoryAudioBucket();
  const audioPath = buildStoryAudioPath(user.id, storyId);

  await adminClient.storage.from(bucket).remove([audioPath]);

  await supabase
    .from("stories")
    .delete()
    .eq("id", storyId)
    .eq("user_id", user.id);

  revalidatePath("/stories");
  revalidatePath("/dashboard");
  redirect("/stories");
}
