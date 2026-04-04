import Link from "next/link";

const principles = [
  "Сказки создаются под конкретную ситуацию дня, а не абстрактно.",
  "Тон историй мягкий, безопасный и без пугающих формулировок.",
  "Личный кабинет помогает сохранить семейный ритуал, а не просто разовую генерацию."
];

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
          О сервисе
        </p>
        <h1 className="mt-4 font-display text-4xl text-white">
          Мы строим сервис, который соединяет семейную заботу и AI-инструменты
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
          MagicStory нужен не для того, чтобы просто удивить текстом. Его задача
          помочь родителям быстро собрать добрую историю под реальную ситуацию и
          встроить ее в семейный вечерний ритуал.
        </p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        {principles.map((item) => (
          <article
            key={item}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-sm leading-7 text-white/75"
          >
            {item}
          </article>
        ))}
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="font-display text-2xl text-white">Что получает семья</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-white/70">
            <li>Персонализированный сюжет под возраст и интересы ребенка.</li>
            <li>Текст и аудио в одной библиотеке.</li>
            <li>Удобный кабинет с профилями детей и историей сказок.</li>
            <li>Понятные тарифы и лимиты без ощущения хаоса.</li>
          </ul>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="font-display text-2xl text-white">
            Как мы подаем продукт
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/70">
            Это не медицинский сервис и не обещание терапевтического результата.
            Мы позиционируем продукт как эмоциональную поддержку, семейный
            инструмент и мягкий воспитательный сценарий в формате сказок.
          </p>
          <Link
            href="/pricing"
            className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-brand-900"
          >
            Посмотреть цены
          </Link>
        </article>
      </section>
    </main>
  );
}
