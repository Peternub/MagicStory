const features = [
  "Персонализация по возрасту, интересам и ситуации дня",
  "Генерация текста сказки на русском языке",
  "Автоматическая озвучка и библиотека готовых историй"
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-brand-700">
            MVP платформы
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-brand-900 sm:text-6xl">
            Магические Сказки
          </h1>
        </div>
      </header>

      <section className="mt-16 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-brand-200/60 bg-white/70 p-8 shadow-glow backdrop-blur">
          <p className="max-w-2xl text-lg leading-8 text-brand-900/85 sm:text-xl">
            Сервис для родителей, который превращает повседневные детские
            ситуации в добрые персональные сказки с озвучкой.
          </p>

          <div className="mt-10 grid gap-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-brand-100 bg-brand-50/70 px-5 py-4 text-sm text-brand-900 sm:text-base"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] bg-brand-900 p-8 text-brand-50 shadow-glow">
          <p className="text-sm uppercase tracking-[0.25em] text-brand-200">
            Ближайшие шаги
          </p>
          <ol className="mt-6 space-y-4 text-sm leading-7 sm:text-base">
            <li>1. Подключить Supabase Auth и профили пользователей.</li>
            <li>2. Реализовать CRUD профилей детей.</li>
            <li>3. Добавить пайплайн генерации сказки и аудио.</li>
          </ol>
        </aside>
      </section>
    </main>
  );
}
