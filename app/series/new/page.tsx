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
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10 sm:px-10">
      <Link href="/series" className="text-sm font-medium text-[var(--logo-text)]">
        Назад к сериалам
      </Link>
      <section className="mt-6 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-8">
        <h1 className="text-3xl font-semibold text-[var(--text-main)]">Новый сериал</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
          Задайте героев и основную идею один раз. Каждый вечер можно добавлять новое событие.
        </p>
        <div className="mt-8">
          {childrenItems.length > 0 ? (
            <SeriesForm action={createSeries} childrenItems={childrenItems} />
          ) : (
            <Link href="/children/new" className="text-[var(--logo-text)]">Сначала добавьте ребенка</Link>
          )}
        </div>
      </section>
    </main>
  );
}
