import Link from "next/link";
import { redirect } from "next/navigation";
import { createChild } from "@/app/actions/children";
import { ChildForm } from "@/components/children/child-form";
import { MAX_CHILD_PROFILES } from "@/lib/config/children";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewChildPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("children")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= MAX_CHILD_PROFILES) {
    redirect("/children");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-10 sm:py-10">
      <Link
        href="/children"
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
          <ChildForm action={createChild} />
        </div>
      </section>
    </main>
  );
}
