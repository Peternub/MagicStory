import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteStoryButton } from "@/components/stories/delete-story-button";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "В очереди",
  text_generating: "Генерация текста",
  completed: "Сказка готова",
  failed: "Ошибка"
};

const statusClasses: Record<string, string> = {
  pending: "border border-brand-300/30 bg-brand-500/10 text-brand-100",
  text_generating: "border border-amber-400/30 bg-amber-500/10 text-amber-200",
  completed: "border border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  failed: "border border-red-400/30 bg-red-500/10 text-red-200"
};

type StoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StoryDetailsPage({ params }: StoryPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: story } = await supabase
    .from("stories")
    .select("id, title, theme, text_content, status, error_message, created_at, children(name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!story) {
    notFound();
  }

  const childName =
    story.children && typeof story.children === "object" && "name" in story.children
      ? String(story.children.name)
      : "ребенка";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10 sm:px-10">
      <Link
        href="/stories"
        className="text-sm font-medium text-brand-200 hover:text-white"
      >
        ← Назад к библиотеке
      </Link>

      <section className="mt-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(21,11,35,0.96),rgba(40,17,74,0.9))] p-8 shadow-glow">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand-200">
              Сказка для {childName}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {story.title ?? "Новая сказка"}
            </h1>
            <div className="mt-4 flex flex-col gap-2 text-sm text-white/70 sm:flex-row sm:items-center sm:gap-4">
              <p
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${statusClasses[story.status] ?? "border border-brand-300/30 bg-brand-500/10 text-brand-100"}`}
              >
                {statusLabels[story.status] ?? story.status}
              </p>
              <p>
                Создано: {new Date(story.created_at).toLocaleDateString("ru-RU")}
              </p>
            </div>
          </div>

          <DeleteStoryButton storyId={story.id} />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#160a27] p-5 text-sm text-white/85">
          <p className="font-medium text-brand-200">Тема дня</p>
          <p className="mt-2">{story.theme}</p>
        </div>

        {story.error_message ? (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {story.error_message}
          </div>
        ) : null}

        {story.status === "text_generating" ? (
          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
            Создаем текст сказки. Обновите страницу чуть позже.
          </div>
        ) : null}

        {story.status === "completed" ? (
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
            Сказка полностью готова и сохранена в вашей библиотеке.
          </div>
        ) : null}

        <article className="prose prose-invert mt-8 max-w-none whitespace-pre-line text-white">
          {story.text_content ?? "Текст сказки еще не готов."}
        </article>
      </section>
    </main>
  );
}
