import type { CSSProperties } from "react";
import Link from "next/link";
import { HouseSection } from "@/components/dashboard/house-section";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type EpisodePreview = {
  created_at: string;
  episode_number: number | null;
  id: string;
  status: string;
  title: string | null;
};

type SeriesPreview = {
  children?: Array<{ name: string }>;
  created_at: string;
  id: string;
  premise: string;
  stories?: EpisodePreview[];
  title: string;
  updated_at: string;
};

type SeriesPageProps = {
  searchParams: Promise<{ series?: string }>;
};

const episodeStatusLabels: Record<string, string> = {
  completed: "Готова",
  failed: "Нужна проверка",
  pending: "В очереди",
  text_generating: "Создаётся"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const user = await requireUser();
  const { series: requestedSeriesId } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("story_series")
    .select(
      "id, title, premise, created_at, updated_at, children(name), stories(id, title, status, episode_number, created_at)"
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const seriesItems = (data ?? []) as SeriesPreview[];
  const selectedSeries =
    seriesItems.find((series) => series.id === requestedSeriesId) ?? seriesItems[0] ?? null;
  const selectedEpisodes = [...(selectedSeries?.stories ?? [])].sort(
    (first, second) => (first.episode_number ?? 0) - (second.episode_number ?? 0)
  );

  return (
    <HouseSection
      room="cinema"
      eyebrow="Домашний кинотеатр"
      title="Библиотека сериалов и серий"
      actions={
        <>
          <Link href="/stories" className="house-secondary-button">Все серии</Link>
          <Link href="/series/new" className="house-primary-button">Создать сериал</Link>
        </>
      }
    >
      {selectedSeries ? (
        <>
          <section className="media-library-layout" aria-label="Выбранный сериал и коллекция">
            <article className="house-panel media-featured">
              <div
                className="media-cover media-cover--featured"
                style={{ "--cover-seed": selectedSeries.title.length % 4 } as CSSProperties}
                aria-hidden="true"
              >
                <span>MS</span>
              </div>
              <div className="media-featured__content">
                <div className="media-featured__meta">
                  <span>{selectedSeries.children?.[0]?.name ?? "Персональный сериал"}</span>
                  <span>{selectedEpisodes.length} серий</span>
                </div>
                <h2>{selectedSeries.title}</h2>
                <p>{selectedSeries.premise}</p>
                <div className="media-featured__footer">
                  <span>Обновлён {formatDate(selectedSeries.updated_at)}</span>
                  <Link href={`/series/${selectedSeries.id}`} className="house-primary-button">Открыть сериал</Link>
                </div>
              </div>
            </article>

            <aside className="house-panel media-collection">
              <div className="media-section-heading">
                <div><h2>Все сериалы</h2></div>
                <span>{seriesItems.length}</span>
              </div>
              <div className="media-collection__grid">
                {seriesItems.map((series, index) => {
                  const episodesCount = series.stories?.length ?? 0;
                  const isSelected = series.id === selectedSeries.id;

                  return (
                    <Link
                      key={series.id}
                      href={`/series?series=${series.id}`}
                      aria-current={isSelected ? "page" : undefined}
                      className={`media-series-card ${isSelected ? "is-selected" : ""}`}
                    >
                      <span className={`media-cover media-cover--${index % 4}`} aria-hidden="true"><b>{index + 1}</b></span>
                      <span className="media-series-card__copy">
                        <strong>{series.title}</strong>
                        <small>{episodesCount} серий · {episodesCount > 0 ? "Активный" : "Новый"}</small>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </aside>
          </section>

          <section className="house-panel media-episodes" aria-labelledby="episodes-title">
            <div className="media-section-heading">
              <div><h2 id="episodes-title">Серии</h2></div>
              <Link href={`/series/${selectedSeries.id}`} className="house-secondary-button">Новая серия</Link>
            </div>

            {selectedEpisodes.length > 0 ? (
              <div className="media-episodes__track">
                {selectedEpisodes.map((episode, index) => (
                  <Link key={episode.id} href={`/stories/${episode.id}`} className="media-episode-card">
                    <span className={`media-episode-card__still media-cover--${index % 4}`} aria-hidden="true"><b>{episode.episode_number ?? index + 1}</b></span>
                    <span className="media-episode-card__copy">
                      <small>Серия {episode.episode_number ?? index + 1} · {formatDate(episode.created_at)}</small>
                      <strong>{episode.title ?? "Новая серия"}</strong>
                      <em>{episodeStatusLabels[episode.status] ?? episode.status}</em>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="media-empty-inline">
                <p>У этого сериала пока нет серий.</p>
                <Link href={`/series/${selectedSeries.id}`}>Создать первую серию →</Link>
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="house-panel media-empty-room">
          <div className="media-empty-room__screen" aria-hidden="true"><span>MS</span></div>
          <h2>Сериалов пока нет</h2>
          <Link href="/series/new" className="house-primary-button">Создать первый сериал</Link>
        </section>
      )}
    </HouseSection>
  );
}
