"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ContactForm } from "@/components/site/contact-form";
import { MarketingPlanCard } from "@/components/site/marketing-plan-card";
import { magicPlans } from "@/lib/config/pricing";
import darkHeroImage from "../image 21.png";
import lightHeroImage from "../image 22.png";

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
    title: "Премиум модель",
    subtitle: "Одна из лучших моделей ИИ в мире",
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

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export default function HomePage() {
  const sequenceRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const node = sequenceRef.current;

      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const total = Math.max(node.offsetHeight - window.innerHeight, 1);
      const next = clamp(-rect.top / total);
      setProgress(next);
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const sceneMetrics = useMemo(() => {
    return storyScenes.map((scene, index) => {
      const target = index / (storyScenes.length - 1);
      const diff = progress - target;
      const opacity = clamp(1 - Math.abs(diff) * 4.2);
      const translateY = diff * -120;
      const scale = 0.96 + opacity * 0.04;

      return {
        scene,
        index,
        opacity,
        transform: `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`
      };
    });
  }, [progress]);

  const rayIntensity = clamp((progress - 0.62) / 0.28);

  return (
    <main>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
        <img
          src={darkHeroImage.src}
          alt=""
          aria-hidden="true"
          className="hero-scene__image hero-scene__image--dark"
        />
        <img
          src={lightHeroImage.src}
          alt=""
          aria-hidden="true"
          className="hero-scene__image hero-scene__image--light"
        />
        <div className="hero-scene__veil" />
        <div className="hero-scene__glow" />

        <div className="hero-copy relative z-10 flex max-w-4xl flex-col items-center text-center">
          <p className="hero-copy__title font-display text-[clamp(3.2rem,9vw,6.4rem)] tracking-[0.28em] text-[var(--logo-text)]">
            MagicStory
          </p>
          <p className="hero-copy__subtitle mt-6 max-w-2xl text-lg leading-8 text-[var(--logo-text)] sm:text-xl">
            Сказки, которые превращают обычный вечер в маленькое чудо.
          </p>
        </div>
      </section>

      <section ref={sequenceRef} className="story-sequence">
        <div className="story-sequence__sticky">
          <div className="story-sequence__bg" />
          <div
            className={`story-sequence__ray ${rayIntensity > 0.04 ? "is-active" : ""}`}
            style={{ opacity: rayIntensity }}
          />

          <div className="story-sequence__content">
            <p className="story-sequence__label">MagicStory</p>

            {sceneMetrics.map((item) => (
              <p
                key={item.scene}
                className="story-sequence__line"
                style={{
                  opacity: item.opacity,
                  transform: item.transform
                }}
              >
                {item.scene}
              </p>
            ))}
          </div>
        </div>
      </section>

      <div className="h-24 bg-[linear-gradient(180deg,transparent_0%,var(--surface-soft)_100%)]" />

      <section id="pricing" className="px-6 py-24 text-[var(--text-main)]">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl sm:text-5xl">
            Качество генерации сказки
          </h2>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {qualityCards.map((card) => (
              <article
                key={card.title}
                className={`rounded-lg border p-6 shadow-glow ${
                  card.tone === "premium"
                    ? "border-[var(--border-strong)] bg-[var(--surface-card-alt)]"
                    : "border-[var(--border-soft)] bg-[var(--surface-card)]"
                }`}
                style={{ boxShadow: "var(--glow-shadow)" }}
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
            Премиум модель создает более живой и увлекательный текст с глубокой
            проработкой характеров.
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

          <div className="grid gap-6 lg:grid-cols-3">
            {magicPlans.map((plan) => (
              <MarketingPlanCard key={plan.code} plan={plan} />
            ))}
          </div>
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
            className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card-alt)] p-8"
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
