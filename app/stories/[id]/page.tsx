import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteStoryButton } from "@/components/stories/delete-story-button";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStoryAudioBucket } from "@/lib/supabase/storage";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  pending: "В очереди",
  text_generating: "Генерация текста",
  text_ready: "Текст готов",
  audio_generating: "Генерация аудио",
  completed: "Готово",
  failed: "Ошибка"
};

const statusClasses: Record<string, string> = {
  pending: "bg-brand-50 text-brand-900",
  text_generating: "bg-amber-50 text-amber-800",
  text_ready: "bg-sky-50 text-sky-800",
  audio_generating: "bg-violet-50 text-violet-800",
  completed: "bg-emerald-50 text-emerald-800",
  failed: "bg-red-50 text-red-700"
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
    .select(
      "id, title, theme, text_content, audio_url, status, error_message, created_at, children(name)"
    )
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

  let signedAudioUrl: string | null = null;

  if (story.audio_url) {
    const bucket = getStoryAudioBucket();
    const { data: signedUrlData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(story.audio_url, 3600);

    signedAudioUrl = signedUrlData?.signedUrl ?? null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10 sm:px-10">
      <Link
        href="/stories"
        className="text-sm font-medium text-brand-700 hover:text-brand-900"
      >
        ← Назад к библиотеке
      </Link>

      <section className="mt-6 rounded-[2rem] border border-brand-200/70 bg-white/90 p-8 shadow-glow">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand-700">
              Сказка для {childName}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-brand-900">
              {story.title ?? "Новая сказка"}
            </h1>
            <div className="mt-4 flex flex-col gap-2 text-sm text-brand-900/70 sm:flex-row sm:items-center sm:gap-4">
              <p
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${statusClasses[story.status] ?? "bg-brand-50 text-brand-900"}`}
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

        <div className="mt-8 rounded-2xl bg-brand-50/80 p-5 text-sm text-brand-900">
          <p className="font-medium">Тема дня</p>
          <p className="mt-2">{story.theme}</p>
        </div>

        {story.error_message ? (
          <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
            {story.error_message}
          </div>
        ) : null}

        {story.status === "text_ready" ? (
          <div className="mt-6 rounded-2xl bg-sky-50 px-5 py-4 text-sm text-sky-800">
            Текст уже готов. Для аудио осталось указать `YANDEX_SPEECHKIT_API_KEY`
            в `.env.local`.
          </div>
        ) : null}

        {story.status === "audio_generating" ? (
          <div className="mt-6 rounded-2xl bg-violet-50 px-5 py-4 text-sm text-violet-800">
            Идет генерация аудио. Обновите страницу чуть позже.
          </div>
        ) : null}

        {story.status === "completed" ? (
          <div className="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            Сказка полностью готова: текст сохранен, аудио загружено.
          </div>
        ) : null}

        <article className="prose prose-stone mt-8 max-w-none whitespace-pre-line text-brand-900">
          {story.text_content ?? "Текст сказки еще не готов."}
        </article>

        <div className="mt-8 rounded-2xl border border-brand-200 bg-white px-5 py-4 text-sm text-brand-900/70">
          {signedAudioUrl ? (
            <audio controls className="w-full" src={signedAudioUrl}>
              Ваш браузер не поддерживает встроенное аудио.
            </audio>
          ) : (
            "Аудио пока недоступно. Для генерации нужно указать ключ Yandex SpeechKit."
          )}
        </div>
      </section>
    </main>
  );
}
