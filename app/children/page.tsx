import Link from "next/link";
import { ChildrenList } from "@/components/children/children-list";
import type { ChildRecord } from "@/lib/types/database";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ChildrenPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("children")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const childrenItems = (data ?? []) as ChildRecord[];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-10 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[var(--logo-text)]">
            Профили детей
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text-main)]">
            Имя, возраст и пол
          </h1>
        </div>

        <Link
          href="/children/new"
          className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--button-dark)] px-5 py-3 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90 sm:w-auto"
        >
          Добавить ребенка
        </Link>
      </header>

      <section className="mt-7 sm:mt-10">
        <ChildrenList childrenItems={childrenItems} />
      </section>
    </main>
  );
}
