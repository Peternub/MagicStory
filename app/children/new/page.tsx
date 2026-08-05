import Link from "next/link";
import { createChild } from "@/app/actions/children";
import { ChildForm } from "@/components/children/child-form";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

type NewChildPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function NewChildPage({ searchParams }: NewChildPageProps) {
  await requireUser();
  const query = await searchParams;
  const returnTo = query.returnTo === "/series/new" ? "/series/new" : undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-10 sm:py-10">
      <Link
        href={returnTo ?? "/children"}
        className="text-sm font-medium text-[var(--logo-text)] transition hover:text-[var(--text-main)]"
      >
        ← Назад к профилям
      </Link>

      <section
        className="mt-5 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-5 sm:mt-6 sm:p-8"
        style={{ boxShadow: "var(--glow-shadow)" }}
      >
        <h1 className="text-3xl font-semibold text-[var(--text-main)]">
          Новый профиль ребенка
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
          Заполните основные данные и интересы ребёнка. Они будут автоматически
          учитываться в новых сериях.
        </p>

        <div className="mt-8">
          <ChildForm action={createChild} returnTo={returnTo} />
        </div>
      </section>
    </main>
  );
}
