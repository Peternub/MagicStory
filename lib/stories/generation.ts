import "server-only";
import { z } from "zod";
import { createGatewayRequestId, generateStory } from "@/lib/ai/generate-story";
import { parsePrivateAliases } from "@/lib/ai/pseudonymization";
import { parseSeriesMemory } from "@/lib/ai/story-memory";
import {
  claimStoryGeneration,
  completeStoryGeneration,
  failStoryGeneration,
  findStoryGenerationState,
  getGenerationContext
} from "@/lib/data/generation";
import { getGenerationActionError } from "@/lib/stories/generation-errors";
import { stripSeriesEpisodePlan } from "@/lib/stories/series-plan";
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
  const existingStory = await findStoryGenerationState(userId, storyId);

  if (!existingStory?.series_id) {
    throw new Error("STORY_NOT_FOUND");
  }

  if (existingStory.status === "completed") {
    return existingStory.series_id;
  }

  const claimed = await claimStoryGeneration(userId, storyId);

  if (!claimed) {
    const currentStory = await findStoryGenerationState(userId, storyId);

    if (currentStory?.status === "completed" && currentStory.series_id) {
      return currentStory.series_id;
    }

    throw new Error("GENERATION_IN_PROGRESS");
  }

  try {
    const context = await getGenerationContext(userId, storyId);

    if (!context) {
      throw new Error("GENERATION_CONTEXT_NOT_FOUND");
    }

    const { child, series, story } = context;

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
      requestId: createGatewayRequestId(story.id),
      modelCode: series.model_code
    });

    return await completeStoryGeneration({
      memory: generated.memory,
      privateAliases: generated.privateAliases,
      provider: generated.provider,
      storyId,
      summary: generated.summary,
      text: generated.text,
      title: generated.title,
      userId
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GENERATION_FAILED";
    await failStoryGeneration(
      userId,
      storyId,
      getGenerationActionError(error)
    );
    console.error("processStoryGeneration failed", { message });
    throw error;
  }
}
