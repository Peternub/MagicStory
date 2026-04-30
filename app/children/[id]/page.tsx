import Link from "next/link";
import { notFound } from "next/navigation";
import { updateChild } from "@/app/actions/children";
import { ChildForm } from "@/components/children/child-form";
import type { ChildRecord } from "@/lib/types/database";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type EditChildPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditChildPage({ params }: EditChildPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: child } = await supabase
    .from("children")
    .select("id, user_id, name, age, gender, interests, fears, additional_context, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!child) {
    notFound();
  }

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
          Изменить профиль ребенка
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
          Обновите имя, возраст или пол. Новые данные будут использоваться при создании следующих сказок.
        </p>

        <div className="mt-8">
          <ChildForm
            action={updateChild}
            child={child as ChildRecord}
            submitLabel="Сохранить изменения"
          />
        </div>
      </section>
    </main>
  );
}
