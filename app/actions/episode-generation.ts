"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { reserveSeriesEpisode } from "@/lib/data/generation";
import {
  getGenerationActionError,
  processStoryGeneration
} from "@/lib/stories/generation";
import { requireUser } from "@/lib/auth/server";
import { parseStoryFormData } from "@/lib/validators/stories";

type StoryActionState = {
  error?: string;
};

const idempotencyKeySchema = z.string().uuid();

export async function createSeriesEpisode(
  _prevState: StoryActionState,
  formData: FormData
): Promise<StoryActionState> {
  const user = await requireUser();
  const parsed = parseStoryFormData(formData);
  const seriesId = formData.get("seriesId");
  const generationKey = idempotencyKeySchema.safeParse(formData.get("generationKey"));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте данные серии" };
  }

  if (typeof seriesId !== "string" || !seriesId || !generationKey.success) {
    return { error: "Не удалось определить сериал" };
  }

  let storyId: string;
  try {
    storyId = await reserveSeriesEpisode({
      generationInput: { situation: parsed.data.situation },
      generationKey: generationKey.data,
      seriesId,
      userId: user.id
    });
  } catch (error) {
    return { error: getGenerationActionError(error) };
  }

  try {
    await processStoryGeneration(user.id, storyId);
  } catch {
    // Ошибка уже сохранена в серии и будет показана после перехода.
  }

  revalidatePath("/series");
  revalidatePath(`/series/${seriesId}`);
  revalidatePath("/stories");
  redirect(`/series/${seriesId}`);
}

export async function resumeStoryGeneration(
  _prevState: StoryActionState,
  formData: FormData
): Promise<StoryActionState> {
  const user = await requireUser();
  const storyId = formData.get("storyId");

  if (typeof storyId !== "string" || !storyId) {
    return { error: "Серия не найдена" };
  }

  let seriesId: string;

  try {
    seriesId = await processStoryGeneration(user.id, storyId);
  } catch (error) {
    return { error: getGenerationActionError(error) };
  }

  revalidatePath("/series");
  revalidatePath(`/series/${seriesId}`);
  revalidatePath(`/stories/${storyId}`);
  redirect(`/series/${seriesId}`);
}
