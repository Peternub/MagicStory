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
        className="text-sm font-medium text-[var(--logo-text)] transition hover:text-[var(--text-main)]"
      >
        ← Назад к профилям
      </Link>

      <section
        className="mt-6 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-8"
        style={{ boxShadow: "var(--glow-shadow)" }}
      >
        <h1 className="text-3xl font-semibold text-[var(--text-main)]">
          Новый профиль ребенка
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
          Здесь нужны только три вещи: имя, возраст и пол. Этого достаточно, чтобы
          быстро выбирать ребенка при создании сказки.
        </p>

        <div className="mt-8">
          <ChildForm action={createChild} />
        </div>
      </section>
    </main>
  );
}
