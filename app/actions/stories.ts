"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateStory } from "@/lib/ai/generate-story";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseStoryFormData } from "@/lib/validators/stories";

type StoryActionState = {
  error?: string;
};

function buildStorySummary(input: {
  mode: "guided" | "auto";
  situation?: string;
  goal: string;
  setting: string;
  durationMinutes: number;
  childRole: string;
}) {
  if (input.mode === "guided" && input.situation) {
    return `${input.situation}. ${input.durationMinutes} мин, цель: ${input.goal}, место: ${input.setting}, роль ребенка: ${input.childRole}`;
  }

  return `Свободный сюжет на ${input.durationMinutes} мин, цель: ${input.goal}, место: ${input.setting}, роль ребенка: ${input.childRole}`;
}

function normalizeCharacterLabel(value: string) {
  return value
    .trim()
    .replace(/^я\s+/i, "")
    .replace(/^моя\s+мама\b/i, "мама")
    .replace(/^мой\s+папа\b/i, "папа")
    .replace(/^моя\s+бабушка\b/i, "бабушка")
    .replace(/^мой\s+дедушка\b/i, "дедушка")
    .replace(/\s+/g, " ");
}

function normalizeCharacters(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .split(",")
    .map(normalizeCharacterLabel)
    .filter(Boolean)
    .join(", ");
}

export async function createStory(
  _prevState: StoryActionState,
  formData: FormData
): Promise<StoryActionState> {
  const user = await requireUser();
  const parsed = parseStoryFormData(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные"
    };
  }

  const supabase = await createSupabaseServerClient();

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

  const storySummary = buildStorySummary(parsed.data);
  const normalizedCharacters = normalizeCharacters(parsed.data.characters);

  const effectiveChild = {
    ...child,
    interests:
      parsed.data.storyInterests ||
      (parsed.data.useProfileInterests ? child.interests : null),
    fears: parsed.data.useProfileFears ? child.fears : null,
    additional_context:
      parsed.data.storyContext ||
      (parsed.data.useProfileContext ? child.additional_context : null)
  };

  const request = {
    ...parsed.data,
    characters: normalizedCharacters
  };

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
    return {
      error: "Не удалось создать запись сказки"
    };
  }

  try {
    const generated = await generateStory({
      child: effectiveChild,
      request
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
      event_type: "story_created",
      amount: 0
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

  await supabase
    .from("stories")
    .delete()
    .eq("id", storyId)
    .eq("user_id", user.id);

  revalidatePath("/stories");
  revalidatePath("/dashboard");
  redirect("/stories");
}
