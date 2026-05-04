"use client";

import { useEffect, useRef } from "react";
import { refreshStoryAudio } from "@/app/actions/stories";

type AudioGenerationProgressProps = {
  storyId: string;
};

const AUDIO_REFRESH_DELAY_MS = 30000;

export function AudioGenerationProgress({ storyId }: AudioGenerationProgressProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      formRef.current?.requestSubmit();
    }, AUDIO_REFRESH_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [storyId]);

  return (
    <div
      className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] px-4 py-3"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-soft)]">
        <span>Озвучка создается</span>
        <span>Плеер появится автоматически</span>
      </div>
      <div className="story-loading mt-3">
        <div className="story-loading__bar" />
      </div>
      <form ref={formRef} action={refreshStoryAudio} className="hidden">
        <input type="hidden" name="storyId" value={storyId} />
        <button type="submit">Обновить</button>
      </form>
    </div>
  );
}
