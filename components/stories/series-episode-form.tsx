"use client";

import { useActionState } from "react";

type StoryActionState = { error?: string };

type SeriesEpisodeFormProps = {
  action: (state: StoryActionState, formData: FormData) => Promise<StoryActionState>;
  childId: string;
  seriesId: string;
  hasEpisodes: boolean;
};

const initialState: StoryActionState = {};

export function SeriesEpisodeForm({
  action,
  childId,
  seriesId,
  hasEpisodes
}: SeriesEpisodeFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="childId" value={childId} />
      <input type="hidden" name="seriesId" value={seriesId} />
      <input type="hidden" name="storyMode" value="adventure" />
      <input type="hidden" name="durationMinutes" value="5" />

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          {hasEpisodes ? "Что добавить в следующую серию" : "С чего начнется первая серия"}
        </span>
        <textarea
          name="situation"
          rows={3}
          maxLength={500}
          placeholder={hasEpisodes ? "Например: сегодня герои находят старую карту" : "Можно оставить пустым"}
          className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] px-4 py-3 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--border-strong)]"
        />
      </label>

      {state.error ? (
        <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[var(--button-dark)] px-4 py-4 font-semibold text-[var(--button-dark-text)] disabled:opacity-70"
      >
        {isPending ? "Создаем эпизод..." : hasEpisodes ? "Продолжить сериал" : "Создать первую серию"}
      </button>
    </form>
  );
}
