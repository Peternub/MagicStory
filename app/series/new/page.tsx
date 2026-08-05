import Link from "next/link";
import { createSeries } from "@/app/actions/series";
import { SeriesForm } from "@/components/stories/series-form";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ChildRecord } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function NewSeriesPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("children")
    .select("*")
    .eq("user_id", user.id)
    .order("name");
  const childrenItems = (data ?? []) as ChildRecord[];

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6 sm:px-10 sm:py-10">
      <Link href="/series" className="text-sm font-medium text-[var(--logo-text)]">
        Назад к сериалам
      </Link>
      <section className="mt-5 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-5 sm:mt-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-[var(--text-main)] sm:text-3xl">Новый вечерний сериал</h1>
        <div className="mt-6 sm:mt-8">
          {childrenItems.length > 0 ? (
            <SeriesForm action={createSeries} childrenItems={childrenItems} />
          ) : (
            <div className="rounded-lg border border-[var(--border-soft)] p-5 text-center">
              <p className="text-[var(--text-main)]">Сначала добавьте ребёнка</p>
              <Link
                href="/children/new?returnTo=%2Fseries%2Fnew"
                className="mt-4 inline-flex rounded-lg bg-[var(--button-dark)] px-5 py-3 text-sm font-semibold text-[var(--button-dark-text)]"
              >
                Добавить ребёнка
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
