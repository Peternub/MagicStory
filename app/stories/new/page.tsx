import Link from "next/link";
import { createStory } from "@/app/actions/stories";
import { StoryForm } from "@/components/stories/story-form";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  await requireUser();

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
          Конструктор новой сказки
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
          Теперь все данные о ребенке вводятся прямо здесь. Выберите настроение,
          ситуацию дня, место действия и дополнительные детали, а сервис соберет
          персональную сказку по этим настройкам.
        </p>

        <div className="mt-8">
          <StoryForm action={createStory} />
        </div>
      </section>
    </main>
  );
}
