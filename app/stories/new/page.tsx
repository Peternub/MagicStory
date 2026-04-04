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
        className="text-sm font-medium text-brand-200 hover:text-white"
      >
        ← Назад к списку сказок
      </Link>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(21,11,35,0.96),rgba(40,17,74,0.9))] p-8 shadow-glow">
        <h1 className="text-3xl font-semibold text-white">
          Создание новой сказки
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/70">
          Выберите ребенка и коротко опишите ситуацию дня. На основе этого мы
          создадим персональную историю.
        </p>

        {(childrenItems ?? []).length === 0 ? (
          <div className="mt-8 rounded-2xl border border-brand-300/20 bg-brand-500/10 p-6 text-sm text-brand-100">
            Сначала нужно добавить хотя бы один профиль ребенка в разделе детей.
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
