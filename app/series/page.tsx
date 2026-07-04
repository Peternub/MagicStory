import Link from "next/link";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SeriesPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: seriesItems } = await supabase
    .from("story_series")
    .select("id, title, premise, created_at, children(name), stories(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 sm:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[var(--logo-text)]">Сериалы</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text-main)]">Истории с продолжением</h1>
        </div>
        <Link href="/series/new" className="rounded-lg bg-[var(--button-dark)] px-5 py-3 text-sm font-semibold text-[var(--button-dark-text)]">
          Создать сериал
        </Link>
      </header>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {(seriesItems ?? []).map((series) => (
          <Link key={series.id} href={`/series/${series.id}`} className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-6 hover:border-[var(--border-strong)]">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">
              {series.children?.[0]?.name ?? "Персональный сериал"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text-main)]">{series.title}</h2>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-soft)]">{series.premise}</p>
            <p className="mt-5 text-sm text-[var(--text-muted)]">Эпизодов: {series.stories?.[0]?.count ?? 0}</p>
          </Link>
        ))}
        {seriesItems?.length === 0 ? (
          <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-8 text-center md:col-span-2">
            <p className="text-[var(--text-main)]">Сериалов пока нет</p>
            <Link href="/series/new" className="mt-4 inline-flex text-[var(--logo-text)]">Создать первый сериал</Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
