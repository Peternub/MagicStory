import Link from "next/link";
import { MarketingPlanCard } from "@/components/site/marketing-plan-card";

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
          Цены
        </p>
        <h1 className="mt-4 font-display text-4xl text-white">
          Прозрачные тарифы без перегруза
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
          Стартовый тариф помогает попробовать продукт, а подписка рассчитана на
          регулярное использование сказок в семье.
        </p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <MarketingPlanCard
          name="Старт"
          price="0 ₽"
          limit="3 сказки"
          description="Для первого знакомства с сервисом, личным кабинетом и форматом персональных историй."
        />
        <MarketingPlanCard
          name="Магия Плюс"
          price="490 ₽"
          limit="30 сказок в месяц"
          description="Основной семейный план для постоянного использования и вечерних ритуалов."
          highlight
        />
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <h2 className="font-display text-xl text-white">
            Что дальше
          </h2>
          <p className="mt-6 text-sm leading-7 text-white/70">
            На следующем этапе в публичной части появится полноценная интеграция
            оплаты через YooKassa и автоматическое продление подписки.
          </p>
          <Link
            href="/billing"
            className="mt-8 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white"
          >
            Открыть кабинет тарифов
          </Link>
        </article>
      </section>
    </main>
  );
}
