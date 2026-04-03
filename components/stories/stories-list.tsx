import Link from "next/link";

type StoryListItem = {
  id: string;
  title: string | null;
  theme: string;
  status: string;
  created_at: string;
};

type StoriesListProps = {
  stories: StoryListItem[];
};

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

export function StoriesList({ stories }: StoriesListProps) {
  if (stories.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-brand-300 bg-white/70 p-8 text-center">
        <p className="text-lg font-medium text-brand-900">
          Сказок пока нет
        </p>
        <p className="mt-3 text-sm text-brand-900/70">
          Создайте первую сказку по теме дня для одного из детей.
        </p>
        <Link
          href="/stories/new"
          className="mt-6 inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white"
        >
          Создать сказку
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {stories.map((story) => (
        <Link
          key={story.id}
          href={`/stories/${story.id}`}
          className="rounded-[2rem] border border-brand-200/70 bg-white/85 p-6 transition hover:border-brand-400"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-brand-900">
                {story.title ?? "Новая сказка"}
              </h2>
              <p className="mt-2 text-sm text-brand-900/70">
                Тема: {story.theme}
              </p>
            </div>
            <div className="text-sm text-brand-900/70">
              <p
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClasses[story.status] ?? "bg-brand-50 text-brand-900"}`}
              >
                {statusLabels[story.status] ?? story.status}
              </p>
              <p className="mt-1">
                {new Date(story.created_at).toLocaleDateString("ru-RU")}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
