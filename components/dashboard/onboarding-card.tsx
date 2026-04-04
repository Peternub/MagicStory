import Link from "next/link";

type OnboardingCardProps = {
  hasChildren: boolean;
  hasStories: boolean;
};

function StatusPill({ done }: { done: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        done ? "bg-emerald-100 text-emerald-800" : "bg-brand-100 text-brand-900"
      }`}
    >
      {done ? "Готово" : "Следующий шаг"}
    </span>
  );
}

export function OnboardingCard({
  hasChildren,
  hasStories
}: OnboardingCardProps) {
  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/85 p-6 shadow-glow sm:p-8">
      <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
        Быстрый старт
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-brand-950">
        Что сделать дальше
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.75rem] bg-brand-50/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-brand-950">
              1. Добавить ребенка
            </h3>
            <StatusPill done={hasChildren} />
          </div>
          <p className="mt-3 text-sm leading-6 text-brand-900/70">
            Один профиль ребенка нужен, чтобы начать создавать персональные сказки.
          </p>
          <Link
            href={hasChildren ? "/children" : "/children/new"}
            className="mt-5 inline-flex rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white"
          >
            {hasChildren ? "Открыть профили" : "Добавить ребенка"}
          </Link>
        </article>

        <article className="rounded-[1.75rem] bg-brand-50/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-brand-950">
              2. Создать сказку
            </h3>
            <StatusPill done={hasStories} />
          </div>
          <p className="mt-3 text-sm leading-6 text-brand-900/70">
            Выберите тему дня и получите готовую историю с текстом и аудио.
          </p>
          <Link
            href={hasStories ? "/stories" : "/stories/new"}
            className="mt-5 inline-flex rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white"
          >
            {hasStories ? "Открыть библиотеку" : "Создать первую сказку"}
          </Link>
        </article>
      </div>
    </section>
  );
}
