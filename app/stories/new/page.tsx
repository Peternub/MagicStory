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
  const { data: childrenItems } = await supabase
    .from("children")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:px-10">
      <Link
        href="/stories"
        className="text-sm font-medium text-brand-700 hover:text-brand-900"
      >
        ← Назад к списку сказок
      </Link>

      <section className="mt-6 rounded-[2rem] border border-brand-200/70 bg-white/85 p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-brand-900">
          Создание новой сказки
        </h1>
        <p className="mt-3 text-sm leading-6 text-brand-900/70">
          Выберите ребенка и коротко опишите ситуацию дня. На основе этого мы
          создадим персональную историю.
        </p>

        {(childrenItems ?? []).length === 0 ? (
          <div className="mt-8 rounded-2xl bg-brand-50 p-6 text-sm text-brand-900">
            Сначала нужно добавить хотя бы один профиль ребенка в разделе
            детей.
          </div>
        ) : (
          <div className="mt-8">
            <StoryForm
              action={createStory}
              childrenItems={(childrenItems ?? []) as ChildRecord[]}
            />
          </div>
        )}
      </section>
    </main>
  );
}
