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
        className="text-sm font-medium text-brand-700 hover:text-brand-900"
      >
        ← Назад к списку детей
      </Link>

      <section className="mt-6 rounded-[2rem] border border-brand-200/70 bg-white/85 p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-brand-900">
          Новый профиль ребенка
        </h1>
        <p className="mt-3 text-sm leading-6 text-brand-900/70">
          Эти данные будут использоваться для персонализации сказок и мягкой
          адаптации сюжета под возраст ребенка.
        </p>

        <div className="mt-8">
          <ChildForm action={createChild} />
        </div>
      </section>
    </main>
  );
}
