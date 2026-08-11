import { ContactForm } from "@/components/site/contact-form";
import { PricingTabs } from "@/components/site/pricing-tabs";

const storyScenes = [
  "Вы пришли с работы, а ребенка уже надо укладывать спать.",
  "Ребенок хочет знакомую историю, где он сам главный герой.",
  "Но вы вспоминаете про SkazKIDS...",
  "И одной кнопкой создаете новую серию его личного вечернего сериала."
];

const qualityCards = [
  {
    title: 'Модель "Plus"',
    subtitle: "Более ровный сюжет и аккуратная детализация",
    value: 73,
    tone: "plus"
  },
  {
    title: 'Модель "Premium"',
    subtitle: "Самая глубокая проработка истории и персонажей",
    value: 98,
    tone: "premium"
  }
] as const;

const metrics = [
  "Качество текста",
  "Связность сюжета",
  "Проработка персонажей"
];

const reviews = [
  "После работы реально стало проще уложить сына: новая история каждый вечер и никаких уговоров.",
  "Дочке нравится, что в сериях появляются ее друзья, любимые места и знакомые мелочи дня.",
  "Текст получается живым, а не шаблонным, поэтому сервис быстро стал частью нашего вечернего ритуала."
];

function getQualityCardClass(tone: (typeof qualityCards)[number]["tone"]) {
  if (tone === "premium") {
    return "border-[var(--accent-gold)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-card-alt)_86%,transparent),color-mix(in_srgb,var(--accent-gold)_14%,var(--surface-card)))] ring-1 ring-[var(--accent-gold-soft)]";
  }

  if (tone === "plus") {
    return "border-[var(--border-strong)] bg-[var(--surface-card-alt)]";
  }

  return "border-[var(--border-strong)] bg-[var(--surface-card-alt)]";
}

export default function HomePage() {
  return (
    <main>
      <section className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-4 py-12 sm:min-h-screen sm:px-6 sm:py-16">
        <div className="hero-copy relative z-10 flex max-w-4xl flex-col items-center text-center">
          <h1 className="hero-wordmark" aria-label="SkazKIDS">
            <span className="hero-wordmark__skaz">Skaz</span>
            <span className="hero-wordmark__kids">
              K<span className="hero-wordmark__star-letter">I</span>DS
            </span>
          </h1>
          <p className="hero-copy__subtitle mt-5 max-w-2xl text-base leading-7 text-[var(--logo-text)] sm:mt-6 sm:text-xl sm:leading-8">
            Вечерние сериалы, которые продолжаются одной кнопкой.
          </p>
        </div>
      </section>

      <section className="story-sequence">
        {storyScenes.map((scene) => (
          <section key={scene} className="story-sequence__panel">
            <div className="story-sequence__content">
              <p className="story-sequence__line is-active">{scene}</p>
            </div>
          </section>
        ))}
      </section>

      <section id="pricing" className="px-4 pb-16 pt-10 text-[var(--text-main)] sm:px-6 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl sm:text-5xl">
            Качество генерации серии
          </h2>

          <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:mt-14 sm:gap-6 md:grid-cols-2">
            {qualityCards.map((card) => (
              <article
                key={card.title}
                className={`rounded-lg border p-5 shadow-glow sm:p-6 ${getQualityCardClass(card.tone)}`}
                style={{
                  boxShadow:
                    card.tone === "premium"
                      ? "var(--glow-shadow), 0 0 38px color-mix(in srgb, var(--accent-gold) 18%, transparent)"
                      : "var(--glow-shadow)"
                }}
              >
                <h3 className="text-2xl font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-soft)]">{card.subtitle}</p>

                <div className="mt-8 grid gap-5">
                  {metrics.map((metric) => (
                    <div key={metric}>
                      <div className="mb-2 flex items-center justify-between gap-4 text-sm font-medium">
                        <span>{metric}</span>
                        <span>{card.value}%</span>
                      </div>
                      <div className="story-meter">
                        <div
                          className="story-meter__fill"
                          style={{ width: `${card.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-base leading-7 text-[var(--text-soft)] sm:text-lg sm:leading-8">
            Модель "Plus" дает заметно более ровный результат, а модель "Premium" делает
            историю глубже, живее и богаче по деталям.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16 text-[var(--text-main)] sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center sm:mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--logo-text)]">
              Тарифы
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl">
              Выберите качество без ограничений
            </h2>
          </div>

          <PricingTabs />
        </div>
      </section>

      <section id="reviews" className="px-4 py-16 text-[var(--text-main)] sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--logo-text)]">
              Отзывы
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl">
              Как родители описывают сервис
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <article
                key={review}
                className={`rounded-lg border p-5 sm:p-6 ${
                  index === 1
                    ? "border-[var(--border-strong)] bg-[var(--surface-card-alt)]"
                    : "border-[var(--border-soft)] bg-[var(--surface-card)]"
                }`}
                style={{ boxShadow: "var(--glow-shadow)" }}
              >
                <p className="text-base leading-8 text-[var(--text-soft)]">{review}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-4 py-16 text-[var(--text-main)] sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div
            className="contact-card rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card-alt)] p-5 sm:p-8"
            style={{ boxShadow: "var(--glow-shadow)" }}
          >
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--logo-text)]">
              Связаться
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">
              Связаться с нами по любым вопросам
            </h2>
            <p className="mt-6 text-base leading-8 text-[var(--text-soft)]">
              Напишите нам, если хотите обсудить сервис, тарифы или любые детали
              работы SkazKIDS.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
