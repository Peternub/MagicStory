"use client";

import { useEffect } from "react";
import { ContactForm } from "@/components/site/contact-form";
import { MarketingPlanCard } from "@/components/site/marketing-plan-card";
import { magicPlans } from "@/lib/config/pricing";

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

export default function HomePage() {
  useEffect(() => {
    document.documentElement.classList.add("home-snap-root");
    document.body.classList.add("home-snap-root");

    const stages = Array.from(
      document.querySelectorAll<HTMLElement>("[data-story-stage]")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.setAttribute(
            "data-visible",
            entry.isIntersecting && entry.intersectionRatio > 0.45 ? "true" : "false"
          );
        });
      },
      {
        threshold: [0.2, 0.45, 0.7]
      }
    );

    stages.forEach((stage) => observer.observe(stage));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("home-snap-root");
      document.body.classList.remove("home-snap-root");
    };
  }, []);

  return (
    <main>
      <section className="home-snap-section flex items-center justify-center px-6 py-16">
        <img
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,23,48,0.84),rgba(21,34,65,0.86))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(205,164,90,0.2),transparent_32%),radial-gradient(circle_at_70%_30%,rgba(157,144,200,0.2),transparent_30%)]" />

        <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
          <p className="font-display text-[clamp(3.2rem,9vw,6.4rem)] tracking-[0.28em] text-[#fff3dd]">
            MagicStory
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#fff8f1]/88 sm:text-xl">
            Сказки, которые превращают обычный вечер в маленькое чудо.
          </p>
        </div>
      </section>

      {storyScenes.map((scene, index) => (
        <section
          key={scene}
          data-story-stage=""
          data-visible={index === 0 ? "true" : "false"}
          className={`home-snap-section flex items-center justify-center px-6 py-16 ${
            index < 3
              ? "bg-[linear-gradient(180deg,#0f1932_0%,#172744_100%)]"
              : "bg-[linear-gradient(180deg,#2a3854_0%,#f2dce1_46%,#fff8f5_100%)]"
          }`}
        >
          <div
            className={`absolute inset-0 ${
              index < 3
                ? "bg-[radial-gradient(circle_at_20%_20%,rgba(205,164,90,0.16),transparent_25%),radial-gradient(circle_at_80%_30%,rgba(157,144,200,0.22),transparent_30%)]"
                : "bg-[linear-gradient(180deg,rgba(15,25,50,0.2),rgba(15,25,50,0.05)_25%,rgba(255,248,245,0.12)_100%)]"
            }`}
          />

          <div className="relative z-10 max-w-4xl text-center text-white">
            <div className="home-panel-content">
              <p className="text-sm uppercase tracking-[0.34em] text-[#f0ddae]">
                Экран {index + 1}
              </p>
              <h2 className="mt-6 text-[clamp(2rem,5vw,4.5rem)] leading-tight">
                {scene}
              </h2>
            </div>
          </div>
        </section>
      ))}

      <div className="h-24 bg-[linear-gradient(180deg,#fff8f5_0%,#fff4f3_100%)]" />

      <section
        id="pricing"
        className="bg-[linear-gradient(180deg,#fff4f3_0%,#fffbf7_100%)] px-6 py-24 text-[#24324c]"
      >
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
                    ? "border-[#e9d8b1] bg-[#fffaf1]"
                    : "border-[#efd9d2] bg-white"
                }`}
              >
                <h3 className="text-2xl font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-[#5b6477]">{card.subtitle}</p>

                <div className="mt-8 grid gap-5">
                  {metrics.map((metric) => (
                    <div key={metric}>
                      <div className="mb-2 flex items-center justify-between gap-4 text-sm font-medium text-[#24324c]">
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

          <p className="mx-auto mt-8 max-w-3xl text-center text-lg leading-8 text-[#5b6477]">
            Премиум модель создает более живой и увлекательный текст с глубокой
            проработкой характеров.
          </p>
        </div>
      </section>

      <section className="bg-[#fffdf8] px-6 pb-24 text-[#24324c]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[#b78397]">
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

      <section
        id="reviews"
        className="bg-[linear-gradient(180deg,#fff8f6_0%,#fff3f1_100%)] px-6 py-24 text-[#24324c]"
      >
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[#b78397]">
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
                className={`rounded-lg border p-6 shadow-glow ${
                  index === 1
                    ? "border-[#ead7b0] bg-[#fffaf1]"
                    : "border-[#efd9d2] bg-white"
                }`}
              >
                <p className="text-base leading-8 text-[#5b6477]">{review}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#fffdf8] px-6 py-24 text-[#24324c]">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border border-[#efd9d2] bg-[#fff6f3] p-8 shadow-glow">
            <p className="text-sm uppercase tracking-[0.3em] text-[#b78397]">
              Связаться
            </p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">
              Связаться с нами по любым вопросам
            </h2>
            <p className="mt-6 text-base leading-8 text-[#5b6477]">
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
