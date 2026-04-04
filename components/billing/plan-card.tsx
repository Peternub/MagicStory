"use client";

import type { MagicPlan } from "@/lib/config/pricing";

type PlanCardProps = {
  plan: MagicPlan;
};

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <article
      className={`${
        plan.highlight ? "pricing-hit-card pricing-hit-card--billing" : ""
      } flex h-full flex-col rounded-[2rem] border p-6 shadow-[0_20px_50px_rgba(9,5,16,0.3)] ${
        plan.highlight
          ? "border-brand-400/60 bg-gradient-to-b from-brand-800/60 to-[#0d0816]"
          : "border-white/10 bg-[#160a27]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-300/40 bg-brand-500/10 text-lg font-semibold text-brand-100">
          {plan.letter}
        </span>
        {plan.highlight ? (
          <span className="rounded-full border border-brand-300/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-100 shadow-[0_0_24px_rgba(155,99,255,0.45)]">
            Хит
          </span>
        ) : null}
      </div>

      <h2 className="mt-5 text-lg font-semibold text-white">{plan.name}</h2>
      <p className="mt-4 text-4xl font-semibold text-white">{plan.price} ₽</p>

      <div className="mt-4 space-y-2 text-sm text-white/75">
        <p>До {plan.generations} генераций в месяц</p>
        <p>До {plan.minutes} минут на сказку</p>
        <p>{plan.hasAudio ? "Озвучка включена" : "Только текст"}</p>
      </div>

      <p className="mt-5 text-sm leading-7 text-white/70">{plan.description}</p>

      <button
        type="button"
        disabled
        className="mt-8 w-full rounded-2xl border border-white/10 bg-[#0e0819] px-4 py-3 text-sm font-medium text-white/70"
      >
        Скоро подключим оплату
      </button>
    </article>
  );
}
