import Link from "next/link";
import { createChild } from "@/app/actions/children";
import { ChildForm } from "@/components/children/child-form";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function NewChildPage() {
  await requireUser();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:px-10">
      <Link
        href="/children"
        className="text-sm font-medium text-brand-200 hover:text-white"
      >
        ← Назад к списку детей
      </Link>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(21,11,35,0.96),rgba(40,17,74,0.9))] p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">
          Новый профиль ребенка
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/70">
          Эти данные помогут персонализировать сюжет, настроение и героев
          сказки.
        </p>

        <div className="mt-8">
          <ChildForm action={createChild} />
        </div>
      </section>
    </main>
  );
}
