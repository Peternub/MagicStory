import Link from "next/link";
import { notFound } from "next/navigation";
import { updateChild } from "@/app/actions/children";
import { ChildForm } from "@/components/children/child-form";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isMissingColumnError } from "@/lib/supabase/errors";
import type { ChildRecord } from "@/lib/types/database";

export const dynamic = "force-dynamic";

type EditChildPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type EditableChild = Omit<ChildRecord, "gender"> & {
  gender?: ChildRecord["gender"];
};

const childSelectWithGender =
  "id, user_id, name, age, gender, interests, fears, additional_context, created_at, updated_at";

const childSelectWithoutGender =
  "id, user_id, name, age, interests, fears, additional_context, created_at, updated_at";

export default async function EditChildPage({ params }: EditChildPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const childResult = await supabase
    .from("children")
    .select(childSelectWithGender)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  let child = childResult.data as EditableChild | null;
  let hasMissingGenderColumn = false;

  if (isMissingColumnError(childResult.error, "gender")) {
    hasMissingGenderColumn = true;

    const fallbackResult = await supabase
      .from("children")
      .select(childSelectWithoutGender)
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fallbackResult.error || !fallbackResult.data) {
      notFound();
    }

    child = {
      ...(fallbackResult.data as Omit<ChildRecord, "gender">),
      gender: undefined
    };
  } else if (childResult.error || !child) {
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
          Изменить профиль ребёнка
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
          Обновите имя, возраст или пол. Новые данные будут использоваться при
          создании следующих историй.
        </p>

        {hasMissingGenderColumn ? (
          <p className="mt-5 rounded-lg border border-amber-300/35 bg-amber-300/12 px-4 py-3 text-sm leading-6 text-amber-100">
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
