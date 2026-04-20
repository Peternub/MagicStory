import Link from "next/link";
import { createStory } from "@/app/actions/stories";
import { StoryForm } from "@/components/stories/story-form";
import type { ChildRecord } from "@/lib/types/database";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("children")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const childrenItems = (data ?? []) as ChildRecord[];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10 sm:px-10">
      <Link
        href="/stories"
        className="text-sm font-medium text-[var(--logo-text)] transition hover:text-[var(--text-main)]"
      >
        ← Назад к библиотеке
      </Link>

      <section
        className="mt-6 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-8"
        style={{ boxShadow: "var(--glow-shadow)" }}
      >
        <h1 className="text-3xl font-semibold text-[var(--text-main)]">
          Создать новую сказку
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
          Мы сократили форму до нескольких главных шагов, чтобы родителю было
          проще заполнить все за минуту.
        </p>

        {childrenItems.length === 0 ? (
          <div className="mt-8 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-6">
            <p className="text-sm text-[var(--text-main)]">
              Сначала добавьте профиль ребенка: имя, возраст и пол.
            </p>
            <Link
              href="/children/new"
              className="mt-4 inline-flex rounded-lg bg-[var(--button-dark)] px-5 py-3 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90"
            >
              Добавить ребенка
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <StoryForm action={createStory} childrenItems={childrenItems} />
          </div>
        )}
      </section>
    </main>
  );
}
