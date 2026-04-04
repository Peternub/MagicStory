import Link from "next/link";
import { MarketingPlanCard } from "@/components/site/marketing-plan-card";
import { magicPlans } from "@/lib/config/pricing";

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-[96rem] flex-col px-6 py-10 sm:px-10">
      <section className="rounded-[2.5rem] border border-white/10 bg-[#160a27] p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
          Цены
        </p>
        <h1 className="mt-4 font-display text-4xl text-white">
          Тарифная линейка M A G I C
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
          Пять тарифов с понятной логикой: от текста без озвучки до длинных озвученных историй.
        </p>
      </section>

      <section className="mt-10 grid gap-5 xl:grid-cols-5">
        {magicPlans.map((plan) => (
          <MarketingPlanCard key={plan.code} plan={plan} />
        ))}
      </section>

      <div className="mt-10">
        <Link
          href="/billing"
          className="inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white"
        >
          Открыть кабинет тарифов
        </Link>
      </div>
    </main>
  );
}
