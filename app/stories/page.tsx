import Link from "next/link";
import { StoriesList } from "@/components/stories/stories-list";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StoriesPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, theme, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[var(--logo-text)]">
            Библиотека сказок
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text-main)]">
            Все созданные истории
          </h1>
        </div>
        <Link
          href="/stories/new"
          className="inline-flex rounded-lg bg-[var(--button-dark)] px-5 py-3 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90"
        >
          Создать сказку
        </Link>
      </header>

      <section className="mt-10">
        <StoriesList stories={stories ?? []} />
      </section>
    </main>
  );
}
