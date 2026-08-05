"use client";

import { useActionState } from "react";

type StoryActionState = { error?: string };

type SeriesEpisodeFormProps = {
  action: (state: StoryActionState, formData: FormData) => Promise<StoryActionState>;
  childId: string;
  seriesId: string;
  hasEpisodes: boolean;
  compact?: boolean;
};

const initialState: StoryActionState = {};

export function SeriesEpisodeForm({
  action,
  childId,
  seriesId,
  hasEpisodes,
  compact = false
}: SeriesEpisodeFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} autoComplete="off" className={compact ? "shrink-0" : "space-y-3"}>
      <input type="hidden" name="childId" value={childId} />
      <input type="hidden" name="seriesId" value={seriesId} />
      <input type="hidden" name="storyMode" value="adventure" />
      <input type="hidden" name="durationMinutes" value="5" />

      {!compact ? (
        <details className="group rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3">
          <summary className="cursor-pointer list-none text-sm font-medium text-[var(--text-soft)] marker:hidden">
            {hasEpisodes ? "Что учесть сегодня?" : "Добавить идею первой серии"}
            <span aria-hidden="true" className="float-right transition group-open:rotate-45">+</span>
          </summary>
          <textarea
            name="situation"
            autoComplete="off"
            rows={3}
            maxLength={500}
            className="mt-3 w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] px-4 py-3 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--border-strong)]"
          />
        </details>
      ) : null}

      {state?.error ? (
        <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className={
          compact
            ? "min-h-10 rounded-lg border border-[var(--border-strong)] px-3 py-2 text-xs font-semibold text-[var(--logo-text)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
            : "min-h-[3rem] w-full rounded-lg bg-[var(--button-dark)] px-4 py-3 text-sm font-semibold text-[var(--button-dark-text)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        }
      >
        {isPending
          ? compact
            ? "Создаём..."
            : "Создаём серию..."
          : compact
            ? "Новая серия"
            : hasEpisodes
              ? "Создать новую серию"
              : "Создать первую серию"}
      </button>
    </form>
  );
}
