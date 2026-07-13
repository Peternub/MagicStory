import Link from "next/link";

const principles = [
  "Серии продолжают один семейный сюжет, а не создаются как случайные разовые тексты.",
  "Тон сериала мягкий, безопасный и без пугающих формулировок.",
  "Личный кабинет помогает сохранить вечерний ритуал, а не просто разовую генерацию."
];

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <section
        className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-8 sm:p-10"
        style={{ boxShadow: "var(--glow-shadow)" }}
      >
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--logo-text)]">
          О сервисе
        </p>
        <h1 className="mt-4 font-display text-4xl text-[var(--text-main)]">
          Мы строим сервис, который соединяет семейную заботу и AI-инструменты
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-soft)]">
          MagicStory нужен не для того, чтобы просто удивить текстом. Его задача
          помочь родителям один раз настроить личный сериал ребенка, а затем
          каждый вечер создавать продолжение одной кнопкой.
        </p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        {principles.map((item) => (
          <article
            key={item}
            className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-8 text-sm leading-7 text-[var(--text-soft)]"
            style={{ boxShadow: "var(--glow-shadow)" }}
          >
            {item}
          </article>
        ))}
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <article
          className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-8"
          style={{ boxShadow: "var(--glow-shadow)" }}
        >
          <h2 className="font-display text-2xl text-[var(--text-main)]">
            Что получает семья
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-soft)]">
            <li>Персонализированный сериал под возраст, интересы и окружение ребенка.</li>
            <li>Все серии собираются в одной личной библиотеке.</li>
            <li>Удобный кабинет родителя с быстрым доступом к сериалам и лимитам.</li>
            <li>Понятные тарифы и остаток серий без ощущения хаоса.</li>
          </ul>
        </article>

        <article
          className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card-alt)] p-8"
          style={{ boxShadow: "var(--glow-shadow)" }}
        >
          <h2 className="font-display text-2xl text-[var(--text-main)]">
            Как мы подаем продукт
          </h2>
          <p className="mt-5 text-sm leading-7 text-[var(--text-soft)]">
            Это не медицинский сервис и не обещание терапевтического результата.
            Мы позиционируем продукт как эмоциональную поддержку, семейный
            инструмент и мягкий воспитательный сценарий в формате вечерних серий.
          </p>
          <Link
            href="/pricing"
            className="mt-8 inline-flex rounded-lg bg-[var(--button-dark)] px-5 py-3 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90"
          >
            Посмотреть цены
          </Link>
        </article>
      </section>
    </main>
  );
}
