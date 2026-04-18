import Link from "next/link";
import { MarketingPlanCard } from "@/components/site/marketing-plan-card";
import { magicPlans } from "@/lib/config/pricing";

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-[96rem] flex-col px-6 py-10 sm:px-10">
      <section className="rounded-lg border border-[#efd9d2] bg-[#fff7f4] p-8 text-[#24324c] sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-[#b78397]">Тарифы</p>
        <h1 className="mt-4 font-display text-4xl">Три пакета сказок без лишнего шума</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5b6477]">
          Выбирайте удобный запас историй: от спокойного старта до большого семейного пакета.
        </p>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-3">
        {magicPlans.map((plan) => (
          <MarketingPlanCard key={plan.code} plan={plan} />
        ))}
      </section>

      <div className="mt-10">
        <Link
          href="/billing"
          className="inline-flex rounded-lg border border-[#ead7d0] bg-white px-5 py-3 text-sm font-medium text-[#24324c]"
        >
          Открыть кабинет тарифов
        </Link>
      </div>
    </main>
  );
}
