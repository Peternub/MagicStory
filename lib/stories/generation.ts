import "server-only";
import { z } from "zod";
import { createSafetyIdentifier, generateStory } from "@/lib/ai/generate-story";
import { parsePrivateAliases } from "@/lib/ai/pseudonymization";
import { parseSeriesMemory } from "@/lib/ai/story-memory";
import { stripSeriesEpisodePlan } from "@/lib/stories/series-plan";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { StoryInput } from "@/lib/validators/stories";

const generationInputSchema = z.object({
  situation: z.string().trim().max(500).optional().default("")
});

export type GenerationInput = z.infer<typeof generationInputSchema>;

function buildStoryRequest(input: {
  childId: string;
  episodeNumber: number;
  generationInput: GenerationInput;
  seriesTitle: string;
  seriesPremise: string;
}): StoryInput {
  const addition = input.generationInput.situation;
  const episodeContext = input.episodeNumber === 1
    ? "Это первая серия: представь мир и постоянных героев через действие."
    : `Это серия ${input.episodeNumber}: продолжи сюжет только по памяти сериала.`;

  return {
    childId: input.childId,
    storyMode: "adventure",
    durationMinutes: 5,
    situation: addition || "автоматическое спокойное продолжение сериала",
    setting: `мир сериала «${input.seriesTitle}»`,
    goal: "спокойно завершить сегодняшний сюжет и оставить мягкий повод вернуться завтра",
    additionalCharacters: undefined,
    extraWishes: [
      `ПАСПОРТ СЕРИАЛА «${input.seriesTitle}»:`,
      stripSeriesEpisodePlan(input.seriesPremise),
      episodeContext,
      addition ? `Событие от родителя: ${addition}` : null
    ]
      .filter(Boolean)
      .join("\n\n")
  };
}

export async function processStoryGeneration(userId: string, storyId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: existingStory } = await supabase
    .from("stories")
    .select("id, series_id, status")
    .eq("id", storyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!existingStory?.series_id) {
    throw new Error("STORY_NOT_FOUND");
  }

  if (existingStory.status === "completed") {
    return existingStory.series_id;
  }

  const { data: claimed, error: claimError } = await supabase.rpc("claim_story_generation", {
    target_story_id: storyId,
    target_user_id: userId
  });

  if (claimError) {
    throw new Error(claimError.message);
  }

  if (!claimed) {
    const { data: currentStory } = await supabase
      .from("stories")
      .select("series_id, status")
      .eq("id", storyId)
      .eq("user_id", userId)
      .maybeSingle();

    if (currentStory?.status === "completed" && currentStory.series_id) {
      return currentStory.series_id;
    }

    throw new Error("GENERATION_IN_PROGRESS");
  }

  try {
    const { data: story } = await supabase
      .from("stories")
      .select("id, child_id, series_id, episode_number, generation_input")
      .eq("id", storyId)
      .eq("user_id", userId)
      .single();

    if (!story?.series_id || !story.episode_number) {
      throw new Error("STORY_NOT_FOUND");
    }

    const [{ data: child }, { data: series }] = await Promise.all([
      supabase
        .from("children")
        .select("id, name, age, gender, interests, fears, additional_context")
        .eq("id", story.child_id)
        .eq("user_id", userId)
        .single(),
      supabase
        .from("story_series")
        .select("id, title, premise, planned_episodes, model_code, series_memory, private_aliases")
        .eq("id", story.series_id)
        .eq("user_id", userId)
        .single()
    ]);

    if (!child || !series) {
      throw new Error("GENERATION_CONTEXT_NOT_FOUND");
    }

    const generationInput = generationInputSchema.parse(story.generation_input ?? {});
    const request = buildStoryRequest({
      childId: child.id,
      episodeNumber: story.episode_number,
      generationInput,
      seriesTitle: series.title,
      seriesPremise: series.premise
    });
    const generated = await generateStory({
      child,
      request,
      episodeNumber: story.episode_number,
      plannedEpisodes: series.planned_episodes,
      seriesMemory: parseSeriesMemory(series.series_memory),
      privateAliases: parsePrivateAliases(series.private_aliases),
      safetyIdentifier: createSafetyIdentifier(userId),
      modelCode: series.model_code
    });

    const { data: seriesId, error: completeError } = await supabase.rpc(
      "complete_story_generation",
      {
        generated_provider: generated.provider,
        generated_summary: generated.summary,
        generated_text: generated.text,
        generated_title: generated.title,
        target_story_id: storyId,
        target_user_id: userId,
        updated_aliases: generated.privateAliases,
        updated_memory: generated.memory
      }
    );

    if (completeError || !seriesId) {
      throw new Error(completeError?.message ?? "STORY_COMPLETION_FAILED");
    }

    return seriesId as string;
  } catch (error) {
    const message = error instanceof Error ? error.message : "GENERATION_FAILED";
    await supabase.rpc("fail_story_generation", {
      failure_message: "Не удалось создать серию. Нажмите «Повторить».",
      target_story_id: storyId,
      target_user_id: userId
    });
    console.error("processStoryGeneration failed", { storyId, userId, message });
    throw error;
  }
}

export function getGenerationActionError(error: unknown) {
  const message = error instanceof Error
    ? error.message
    : error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "";

  if (message.includes("GENERATION_ALREADY_RUNNING") || message === "GENERATION_IN_PROGRESS") {
    return "Другая серия уже создаётся. Дождитесь её завершения.";
  }

  if (message.includes("FAILED_EPISODE_REQUIRES_RETRY")) {
    return "Сначала повторите незавершённую серию.";
  }

  if (message.includes("SERIES_COMPLETED")) {
    return "Все серии уже созданы.";
  }

  return "Не удалось создать серию. Попробуйте ещё раз.";
}
