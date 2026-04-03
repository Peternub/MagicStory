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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-brand-700">
            Профили детей
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-brand-900">
            Управление детьми
          </h1>
        </div>

        <Link
          href="/children/new"
          className="inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white"
        >
          Добавить ребенка
        </Link>
      </header>

      <section className="mt-10">
        <ChildrenList childrenItems={childrenItems} />
      </section>
    </main>
  );
}
