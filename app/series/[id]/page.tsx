import Link from "next/link";
import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import {
  createSeriesEpisode,
  resumeStoryGeneration
} from "@/app/actions/episode-generation";
import { GenerationRecovery } from "@/components/stories/generation-recovery";
import { SeriesEpisodeForm } from "@/components/stories/series-episode-form";
import { findSeriesDetailsByUser } from "@/lib/data/series";
import { stripSeriesEpisodePlan } from "@/lib/stories/series-plan";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

type SeriesDetailsPageProps = { params: Promise<{ id: string }> };

export default async function SeriesDetailsPage({ params }: SeriesDetailsPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const { series, episodes } = await findSeriesDetailsByUser(user.id, id);

  if (!series) notFound();

  const completedEpisodes = episodes.filter((episode) => episode.status === "completed");
  const unfinishedEpisode = episodes.find((episode) => episode.status !== "completed");
  const episodesCount = completedEpisodes.length;
  const plannedEpisodes = series.planned_episodes;
  const isComplete = series.status === "completed" || episodesCount >= plannedEpisodes;
  const generationIsStale = unfinishedEpisode?.status === "generating" &&
    unfinishedEpisode.generation_started_at !== null &&
    new Date(unfinishedEpisode.generation_started_at).getTime() < Date.now() - 10 * 60 * 1000;

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-10 sm:py-10">
      <Link href="/series" className="text-sm font-medium text-[var(--logo-text)]">Назад к сериалам</Link>
      <header className="mt-6 border-b border-[var(--border-soft)] pb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--logo-text)]">Сериал для {series.children?.[0]?.name}</p>
        <h1 className="mt-2 break-words text-3xl font-semibold text-[var(--text-main)] sm:text-4xl">{series.title}</h1>
        <p className="mt-4 max-w-3xl whitespace-pre-line leading-7 text-[var(--text-soft)]">{stripSeriesEpisodePlan(series.premise)}</p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section>
          <h2 className="text-2xl font-semibold text-[var(--text-main)]">Все серии</h2>
          <div className="mt-4 grid gap-3">
            {episodes.map((episode) => {
              const content = (
                <>
                  <p className="text-xs text-[var(--logo-text)]">Серия {episode.episode_number}</p>
                  <p className="mt-1 font-semibold text-[var(--text-main)]">
                    {episode.title ?? (episode.status === "failed" ? "Не удалось создать" : "Создаётся...")}
                  </p>
                </>
              );

              return episode.status === "completed" ? (
                <Link
                  key={episode.id}
                  href={`/stories/${episode.id}`}
                  className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 hover:border-[var(--border-strong)]"
                >
                  {content}
                </Link>
              ) : (
                <article
                  key={episode.id}
                  className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-5"
                >
                  {content}
                </article>
              );
            })}
            {episodes.length === 0 ? <p className="text-sm text-[var(--text-soft)]">Первая серия еще не создана.</p> : null}
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-6">
          {isComplete ? (
            <>
              <h2 className="text-xl font-semibold text-[var(--text-main)]">Сериал завершён</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">Все {plannedEpisodes} серий готовы.</p>
              <Link href="/series?view=completed" className="house-primary-button mt-5">Открыть коллекцию</Link>
            </>
          ) : unfinishedEpisode ? (
            <>
              <h2 className="text-xl font-semibold text-[var(--text-main)]">
                Серия {unfinishedEpisode.episode_number} из {plannedEpisodes}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">
                {unfinishedEpisode.status === "failed"
                  ? unfinishedEpisode.error_message ?? "Генерация прервалась."
                  : "Серия сохранена и продолжит создаваться после перезагрузки."}
              </p>
              <div className="mt-5">
                <GenerationRecovery
                  action={resumeStoryGeneration}
                  autoStart={unfinishedEpisode.status === "pending" || generationIsStale}
                  status={unfinishedEpisode.status}
                  storyId={unfinishedEpisode.id}
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-[var(--text-main)]">Серия {episodesCount + 1} из {plannedEpisodes}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">Можно ничего не писать: система сама продолжит сериал по памяти.</p>
              <div className="mt-5">
                <SeriesEpisodeForm
                  action={createSeriesEpisode}
                  childId={series.child_id}
                  generationKey={randomUUID()}
                  seriesId={series.id}
                  hasEpisodes={episodesCount > 0}
                />
              </div>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
