import Link from "next/link";
import { PricingTabs } from "@/components/site/pricing-tabs";

export default function PricingPage() {
  return (
    <main className="mx-auto flex w-full max-w-[96rem] flex-col px-6 py-10 sm:px-10">
      <section className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-8 text-[var(--text-main)] sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--logo-text)]">Тарифы</p>
        <h1 className="mt-4 font-display text-4xl">
          Пакеты сказок и аудио-сказок
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-soft)]">
          Выбирайте обычные сказки или аудио-наборы, а затем переключайте модель
          генерации под нужный уровень качества.
        </p>
      </section>

      <section className="mt-10">
        <PricingTabs />
      </section>

      <div className="mt-10">
        <Link
          href="/billing"
          className="inline-flex rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] px-5 py-3 text-sm font-medium text-[var(--text-main)]"
        >
          Открыть кабинет тарифов
        </Link>
      </div>
    </main>
  );
}
