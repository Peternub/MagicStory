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
  pending: "border border-brand-300/30 bg-brand-500/10 text-brand-100",
  text_generating: "border border-amber-400/30 bg-amber-500/10 text-amber-200",
  text_ready: "border border-sky-400/30 bg-sky-500/10 text-sky-200",
  audio_generating: "border border-violet-400/30 bg-violet-500/10 text-violet-200",
  completed: "border border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  failed: "border border-red-400/30 bg-red-500/10 text-red-200"
};

export function StoriesList({ stories }: StoriesListProps) {
  if (stories.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[#160a27] p-8 text-center">
        <p className="text-lg font-medium text-white">Сказок пока нет</p>
        <p className="mt-3 text-sm text-white/70">
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
          className="rounded-[2rem] border border-white/10 bg-[#160a27] p-6 transition hover:border-brand-400/50 hover:bg-[#1b0d30]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {story.title ?? "Новая сказка"}
              </h2>
              <p className="mt-2 text-sm text-white/70">Тема: {story.theme}</p>
            </div>
            <div className="text-sm text-white/70">
              <p
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClasses[story.status] ?? "border border-brand-300/30 bg-brand-500/10 text-brand-100"}`}
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
