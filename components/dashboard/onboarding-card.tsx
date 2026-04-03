import Link from "next/link";

type OnboardingCardProps = {
  hasChildren: boolean;
  hasStories: boolean;
};

function StepStatus({ done }: { done: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        done ? "bg-emerald-50 text-emerald-800" : "bg-brand-50 text-brand-900"
      }`}
    >
      {done ? "Готово" : "Нужно сделать"}
    </span>
  );
}

export function OnboardingCard({
  hasChildren,
  hasStories
}: OnboardingCardProps) {
  return (
    <section className="mt-10 rounded-[2rem] border border-brand-200/70 bg-white/85 p-8 shadow-glow">
      <p className="text-sm uppercase tracking-[0.25em] text-brand-700">
        Первый запуск
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-brand-900">
        Быстрый маршрут по продукту
      </h2>

      <div className="mt-6 grid gap-4">
        <div className="rounded-2xl bg-brand-50/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-brand-900">1. Добавить ребенка</p>
              <p className="mt-2 text-sm text-brand-900/70">
                Заполните профиль, чтобы персонализировать сказки.
              </p>
            </div>
            <StepStatus done={hasChildren} />
          </div>
          {!hasChildren ? (
            <Link
              href="/children/new"
              className="mt-4 inline-flex rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white"
            >
              Перейти к профилю
            </Link>
          ) : null}
        </div>

        <div className="rounded-2xl bg-brand-50/70 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-brand-900">2. Создать сказку</p>
              <p className="mt-2 text-sm text-brand-900/70">
                Выберите тему дня и получите текст с аудио.
              </p>
            </div>
            <StepStatus done={hasStories} />
          </div>
          {hasChildren && !hasStories ? (
            <Link
              href="/stories/new"
              className="mt-4 inline-flex rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white"
            >
              Создать первую сказку
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
