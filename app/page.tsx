import { ContactForm } from "@/components/site/contact-form";
import { PricingTabs } from "@/components/site/pricing-tabs";

const storyScenes = [
  "Вы пришли с работы, а ребенка уже надо укладывать спать.",
  "Ребенок хочет спать, но слушать устаревшие сказки не хочет.",
  "Но вы вспоминаете про MagicStory...",
  "И можете создать персональную сказку про ребенка и его друзей!"
];

const qualityCards = [
  {
    title: "Бесплатная модель",
    subtitle: "Для 3 пробных сказок",
    value: 60,
    tone: "soft"
  },
  {
    title: "Модель плюс",
    subtitle: "Более ровный сюжет и аккуратная детализация",
    value: 73,
    tone: "plus"
  },
  {
    title: "Премиум-модель",
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
  "Дочке нравится, что в сказках появляются ее друзья, любимые места и знакомые мелочи дня.",
  "Текст получается живым, а не шаблонным, поэтому сервис быстро стал частью нашего вечернего ритуала."
];

function getQualityCardClass(tone: (typeof qualityCards)[number]["tone"]) {
  if (tone === "premium") {
    return "border-[var(--accent-gold)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-card-alt)_86%,transparent),color-mix(in_srgb,var(--accent-gold)_14%,var(--surface-card)))] ring-1 ring-[var(--accent-gold-soft)]";
  }

  if (tone === "plus") {
    return "border-[var(--border-strong)] bg-[var(--surface-card-alt)]";
  }

  return "border-[var(--border-soft)] bg-[var(--surface-card)]";
}

export default function HomePage() {
  return (
    <main>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
        <div className="hero-copy relative z-10 flex max-w-4xl flex-col items-center text-center">
          <p className="hero-copy__title font-display text-[clamp(3.2rem,9vw,6.4rem)] tracking-[0.28em] text-[var(--logo-text)]">
            MagicStory
          </p>
          <p className="hero-copy__subtitle mt-6 max-w-2xl text-lg leading-8 text-[var(--logo-text)] sm:text-xl">
            Сказки, которые превращают обычный вечер в маленькое чудо.
          </p>
        </div>
      </section>

      <section className="story-sequence">
        {storyScenes.map((scene, index) => (
          <section key={scene} className="story-sequence__panel">
            <div className="story-sequence__content">
              <p className="story-sequence__label">MagicStory / 0{index + 1}</p>
              <p className="story-sequence__line is-active">{scene}</p>
            </div>
          </section>
        ))}
      </section>

      <section id="pricing" className="px-6 pb-24 pt-8 text-[var(--text-main)] sm:pt-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl sm:text-5xl">
            Качество генерации сказки
          </h2>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {qualityCards.map((card) => (
              <article
                key={card.title}
                className={`rounded-lg border p-6 shadow-glow ${getQualityCardClass(card.tone)}`}
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

          <p className="mx-auto mt-8 max-w-3xl text-center text-lg leading-8 text-[var(--text-soft)]">
            Модель плюс дает заметно более ровный результат, а премиум-модель делает
            историю глубже, живее и богаче по деталям.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24 text-[var(--text-main)]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--logo-text)]">
              Тарифы
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl">
              Выберите удобный запас сказок
            </h2>
          </div>

          <PricingTabs />
        </div>
      </section>

      <section id="reviews" className="px-6 py-24 text-[var(--text-main)]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--logo-text)]">
              Отзывы
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl">
              Как родители описывают сервис
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <article
                key={review}
                className={`rounded-lg border p-6 ${
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

      <section id="contact" className="px-6 py-24 text-[var(--text-main)]">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div
            className="contact-card magic-hover rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card-alt)] p-8"
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
              работы MagicStory.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
