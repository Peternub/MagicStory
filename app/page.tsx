import Link from "next/link";
import { ContactForm } from "@/components/site/contact-form";
import { MarketingPlanCard } from "@/components/site/marketing-plan-card";

const highlights = [
  {
    title: "Персонализация без шаблонности",
    text: "Сюжет опирается на возраст ребенка, его интересы, страхи и конкретную ситуацию дня."
  },
  {
    title: "Текст и аудио в одном сценарии",
    text: "История появляется в библиотеке и может быть прочитана или прослушана перед сном."
  },
  {
    title: "Нормальный кабинет, а не хаос",
    text: "Профили детей, сказки, баланс и тарифы собраны в одном понятном интерфейсе."
  }
];

const reviews = [
  "Сын стал спокойнее относиться к вечерним ритуалам. История ощущается очень личной.",
  "Нравится, что сказка опирается на интересы ребенка, а не выглядит случайным текстом.",
  "Это уже полноценный семейный сервис, а не просто генератор фраз."
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col px-6 py-10 sm:px-10">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <h1 className="mt-5 max-w-4xl font-display text-4xl leading-tight text-white sm:text-6xl">
            Мама отдыхает, ребенок засыпает
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Превратите капризы и страхи вашего ребенка в бесконечный аудиосериал,
            где он сам становится главным героем, преодолевающим трудности вместе
            со своими любимыми игрушками. Всего в пару кликов система генерирует
            уникальную терапевтическую сказку с приятной озвучкой, которая мягко
            уложит малыша спать и подарит вам такие долгожданные минуты вечерней
            тишины.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth/sign-up"
              className="inline-flex rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-3 text-sm font-medium text-white shadow-glow"
            >
              Зарегистрироваться
            </Link>
            <Link
              href="/#pricing"
              className="inline-flex rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/85"
            >
              Посмотреть цены
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-brand-400/25 bg-gradient-to-br from-brand-800/40 via-[#130a24] to-[#0a0612] p-6 shadow-glow"
            >
              <h2 className="font-display text-xl text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/75">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="mt-16">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.22em] text-brand-200">
            Цены
          </p>
          <h2 className="mt-3 font-display text-3xl text-white">
            Прозрачные тарифы без перегруза
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <MarketingPlanCard
            name="Старт"
            price="0 ₽"
            limit="3 сказки для знакомства"
            description="Подходит, чтобы проверить формат и добавить первый семейный сценарий."
          />
          <MarketingPlanCard
            name="Магия Плюс"
            price="490 ₽"
            limit="30 сказок в месяц"
            description="Регулярная подписка для родителей, которые хотят использовать сервис постоянно."
            highlight
          />
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <h2 className="font-display text-xl text-white">
              Индивидуальный сценарий
            </h2>
            <p className="mt-6 text-sm leading-7 text-white/70">
              Для семейных клубов и детских студий можно собрать отдельный пакет
              после запуска базовой оплаты через YooKassa.
            </p>
            <Link
              href="/billing"
              className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-brand-900"
            >
              Открыть кабинет тарифов
            </Link>
          </article>
        </div>
      </section>

      <section
        id="reviews"
        className="mt-16 rounded-[2rem] border border-white/10 bg-white/5 p-8"
      >
        <p className="text-sm uppercase tracking-[0.22em] text-brand-200">
          Отзывы
        </p>
        <h2 className="mt-3 font-display text-3xl text-white">
          Как родители описывают сервис
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review}
              className="rounded-[1.75rem] border border-white/10 bg-[#0d0818] p-6 text-sm leading-7 text-white/75"
            >
              {review}
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="mt-16">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.22em] text-brand-200">
            Контакты
          </p>
          <h2 className="mt-3 font-display text-3xl text-white">
            Связаться с нами и обсудить проект
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-sm leading-7 text-white/70">
              На этой странице можно оставить сообщение о продукте, партнерстве,
              семейном использовании сервиса или будущем запуске оплаты.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-[#0d0818] p-5">
                <p className="text-sm font-medium text-white">Для родителей</p>
                <p className="mt-2 text-sm text-white/65">
                  Вопросы по регистрации, кабинетам детей, сказкам и подписке.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0d0818] p-5">
                <p className="text-sm font-medium text-white">Для партнеров</p>
                <p className="mt-2 text-sm text-white/65">
                  Интерес к совместным проектам, пакетам для студий и семейных клубов.
                </p>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
