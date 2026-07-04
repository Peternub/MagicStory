import Link from "next/link";
import { notFound } from "next/navigation";
import { createStory } from "@/app/actions/stories";
import { SeriesEpisodeForm } from "@/components/stories/series-episode-form";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SeriesDetailsPageProps = { params: Promise<{ id: string }> };

export default async function SeriesDetailsPage({ params }: SeriesDetailsPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [{ data: series }, { data: episodes }] = await Promise.all([
    supabase
      .from("story_series")
      .select("id, child_id, title, premise, children(name)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("stories")
      .select("id, title, status, episode_number, created_at")
      .eq("series_id", id)
      .eq("user_id", user.id)
      .order("episode_number", { ascending: true })
  ]);

  if (!series) notFound();

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10 sm:px-10">
      <Link href="/series" className="text-sm font-medium text-[var(--logo-text)]">Назад к сериалам</Link>
      <header className="mt-6 border-b border-[var(--border-soft)] pb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--logo-text)]">Сериал для {series.children?.[0]?.name}</p>
        <h1 className="mt-2 text-4xl font-semibold text-[var(--text-main)]">{series.title}</h1>
        <p className="mt-4 max-w-3xl leading-7 text-[var(--text-soft)]">{series.premise}</p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <section>
          <h2 className="text-2xl font-semibold text-[var(--text-main)]">Все эпизоды</h2>
          <div className="mt-4 grid gap-3">
            {(episodes ?? []).map((episode) => (
              <Link key={episode.id} href={`/stories/${episode.id}`} className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 hover:border-[var(--border-strong)]">
                <p className="text-xs text-[var(--logo-text)]">Эпизод {episode.episode_number}</p>
                <p className="mt-1 font-semibold text-[var(--text-main)]">{episode.title ?? "Новый эпизод"}</p>
              </Link>
            ))}
            {episodes?.length === 0 ? <p className="text-sm text-[var(--text-soft)]">Первая серия еще не создана.</p> : null}
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-6">
          <h2 className="text-xl font-semibold text-[var(--text-main)]">Сегодняшнее продолжение</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-soft)]">Добавьте одно событие или оставьте поле пустым.</p>
          <div className="mt-5">
            <SeriesEpisodeForm action={createStory} childId={series.child_id} seriesId={series.id} hasEpisodes={(episodes?.length ?? 0) > 0} />
          </div>
        </aside>
      </div>
    </main>
  );
}
