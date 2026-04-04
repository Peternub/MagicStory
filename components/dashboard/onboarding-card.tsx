import Link from "next/link";

type OnboardingCardProps = {
  hasChildren: boolean;
  hasStories: boolean;
};

function StatusPill({ done }: { done: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        done
          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border border-brand-200 bg-white text-brand-900"
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
    <section className="mt-8 rounded-[2.25rem] border border-white/10 bg-white/95 p-6 shadow-[0_20px_60px_rgba(9,5,16,0.2)] sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
          Быстрый старт
        </p>
        <h2 className="text-3xl font-semibold text-brand-900">
          Что сделать дальше
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-brand-900/75">
          Два шага до первой сказки.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <article className="rounded-[1.75rem] border border-brand-100 bg-[#f7f3ff] p-6 shadow-[0_10px_30px_rgba(80,26,184,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-brand-600">
                Шаг 1
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-brand-900">
                Добавить ребенка
              </h3>
            </div>
            <StatusPill done={hasChildren} />
          </div>

          <p className="mt-4 text-base leading-7 text-brand-900/75">
            Заполните профиль ребенка для персональных сказок.
          </p>

          <Link
            href={hasChildren ? "/children" : "/children/new"}
            className="mt-6 inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            {hasChildren ? "Открыть профили" : "Добавить ребенка"}
          </Link>
        </article>

        <article className="rounded-[1.75rem] border border-brand-100 bg-[#f7f3ff] p-6 shadow-[0_10px_30px_rgba(80,26,184,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-brand-600">
                Шаг 2
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-brand-900">
                Создать сказку
              </h3>
            </div>
            <StatusPill done={hasStories} />
          </div>

          <p className="mt-4 text-base leading-7 text-brand-900/75">
            Выберите тему дня и получите готовую историю с аудио.
          </p>

          <Link
            href={hasStories ? "/stories" : "/stories/new"}
            className="mt-6 inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            {hasStories ? "Открыть библиотеку" : "Создать первую сказку"}
          </Link>
        </article>
      </div>
    </section>
  );
}
