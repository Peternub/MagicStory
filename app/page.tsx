import Link from "next/link";

const benefits = [
  "Персональная сказка под возраст, характер и ситуацию дня",
  "Мягкий воспитательный сценарий без назидательного тона",
  "Текст и аудио в одном месте, чтобы слушать перед сном"
];

const examples = [
  "Не хотел убирать игрушки",
  "Боялся спать один",
  "Поссорился с другом",
  "Не хотел идти в садик"
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand-700">
              Магические Сказки
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-brand-900 sm:text-5xl">
              Персональные сказки, которые помогают прожить важный день мягко и
              спокойно
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/sign-up"
              className="inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white"
            >
              Зарегистрироваться
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex rounded-full border border-brand-300 px-5 py-3 text-sm font-medium text-brand-900"
            >
              Войти
            </Link>
          </div>
        </header>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-brand-200/60 bg-white/80 p-8 shadow-glow backdrop-blur">
            <p className="max-w-2xl text-lg leading-8 text-brand-900/85 sm:text-xl">
              Создавайте сказки для своего ребенка по реальным ситуациям:
              тревога, капризы, конфликты, страхи, сложные вечерние ритуалы.
              Сервис превращает тему дня в добрую историю и озвучивает ее.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth/sign-up"
                className="inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white"
              >
                Начать бесплатно
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex rounded-full border border-brand-300 px-5 py-3 text-sm font-medium text-brand-900"
              >
                Открыть кабинет
              </Link>
            </div>

            <div className="mt-10 grid gap-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-2xl border border-brand-100 bg-brand-50/70 px-5 py-4 text-sm text-brand-900 sm:text-base"
                >
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] bg-brand-900 p-8 text-brand-50 shadow-glow">
            <p className="text-sm uppercase tracking-[0.25em] text-brand-200">
              Как это работает
            </p>

            <div className="mt-6 space-y-5">
              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm font-medium text-brand-50">
                  1. Добавьте ребенка
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-100/80">
                  Имя, возраст, интересы и особенности помогают сделать историю
                  узнаваемой и близкой.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm font-medium text-brand-50">
                  2. Опишите тему дня
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-100/80">
                  Например: ребенок поссорился с другом или не хотел убирать
                  игрушки.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-5">
                <p className="text-sm font-medium text-brand-50">
                  3. Получите сказку и аудио
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-100/80">
                  История сохраняется в библиотеке и доступна для чтения и
                  прослушивания.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-10 rounded-[2rem] border border-brand-200/60 bg-white/75 p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-brand-700">
            Примеры тем
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {examples.map((example) => (
              <span
                key={example}
                className="rounded-full bg-brand-50 px-4 py-2 text-sm text-brand-900"
              >
                {example}
              </span>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
