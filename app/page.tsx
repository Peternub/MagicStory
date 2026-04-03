import Link from "next/link";
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
    text: "Профили детей, баланс, сказки, тарифы и onboarding собраны в одном интерфейсе."
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
          <p className="text-sm uppercase tracking-[0.28em] text-brand-200">
            B2C SaaS для родителей
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl leading-tight text-white sm:text-6xl">
            Полноценный сервис персональных сказок с аудио, тарифами, отзывами
            и личным кабинетом
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Магические Сказки помогают родителям превращать реальные детские
            ситуации в добрые истории с озвучкой, библиотекой сказок и понятным
            пользовательским сценарием от регистрации до прослушивания.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth/sign-up"
              className="inline-flex rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-3 text-sm font-medium text-white shadow-glow"
            >
              Зарегистрироваться
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-white/85"
            >
              Посмотреть цены
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-semibold text-white">3 мин</p>
              <p className="mt-2 text-sm text-white/60">
                чтобы получить готовую сказку под тему дня
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-semibold text-white">2 формата</p>
              <p className="mt-2 text-sm text-white/60">
                текст и аудио в одном личном кабинете
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <p className="text-3xl font-semibold text-white">RF</p>
              <p className="mt-2 text-sm text-white/60">
                сервис адаптирован под российский рынок
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-brand-400/30 bg-gradient-to-br from-brand-800/60 via-[#130a24] to-[#0a0612] p-8 shadow-glow">
          <p className="text-sm uppercase tracking-[0.22em] text-brand-200">
            Что уже внутри
          </p>
          <div className="mt-6 space-y-4">
            {[
              "Профили детей и их интересов",
              "Генерация сказки по теме дня",
              "Озвучка и прослушивание в браузере",
              "История сказок и лимиты",
              "Тарифы, onboarding и кабинет"
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/80"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-8"
          >
            <h2 className="font-display text-xl text-white">{item.title}</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.22em] text-brand-200">
            Что мы представляем
          </p>
          <h2 className="mt-4 font-display text-3xl text-white">
            Семейный digital-продукт, а не одностраничную заглушку
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/70">
            Мы собираем сайт и приложение как единый продукт: публичные страницы
            для знакомства с сервисом, отдельные разделы с ценами, отзывами и
            контактами, а внутри — полноценный кабинет с генерацией сказок.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex rounded-full border border-brand-400/40 px-5 py-3 text-sm font-medium text-brand-100"
          >
            Подробнее о сервисе
          </Link>
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
              href="/contact"
              className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-brand-900"
            >
              Обсудить запуск
            </Link>
          </article>
        </div>
      </section>

      <section className="mt-16 rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-brand-200">
              Отзывы
            </p>
            <h2 className="mt-3 font-display text-3xl text-white">
              Как родители описывают сервис
            </h2>
          </div>
          <Link href="/reviews" className="text-sm text-brand-100 hover:text-white">
            Смотреть все отзывы
          </Link>
        </div>

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

      <section className="mt-16 rounded-[2.5rem] border border-brand-400/30 bg-gradient-to-r from-brand-800/60 to-[#0c0715] p-8 shadow-glow sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-brand-200">
              Сайт и приложение вместе
            </p>
            <h2 className="mt-3 font-display text-3xl text-white">
              Открывайте сервис, регистрируйтесь и переходите в кабинет без
              ощущения, что вы попали в черновик
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/sign-up"
              className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-brand-900"
            >
              Создать аккаунт
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white"
            >
              Связаться с нами
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
