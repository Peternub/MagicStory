import Link from "next/link";
import { notFound } from "next/navigation";
import { updateChild } from "@/app/actions/children";
import { ChildForm } from "@/components/children/child-form";
import { findChildByUser } from "@/lib/data/children";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

type EditChildPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditChildPage({ params }: EditChildPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const { child, hasMissingGenderColumn } = await findChildByUser(user.id, id);

  if (!child) {
    notFound();
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
          Изменить профиль ребёнка
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
          Обновите данные, друзей и интересы ребёнка. Изменения будут использоваться
          при создании следующих историй.
        </p>

        {hasMissingGenderColumn ? (
          <p className="mt-5 rounded-lg border border-[#c47d1f]/35 bg-[#fff4cf] px-4 py-3 text-sm leading-6 text-[#4a3411] shadow-sm">
            В базе не применена миграция пола ребёнка. Редактирование имени и
            возраста работает, но пол сохранится только после применения
            миграции 20260420_006_add_child_gender.sql.
          </p>
        ) : null}

        <div className="mt-8">
          <ChildForm
            action={updateChild}
            child={child}
            submitLabel="Сохранить изменения"
          />
        </div>
      </section>
    </main>
  );
}
