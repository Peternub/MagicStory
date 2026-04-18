"use client";

import type { MagicPlan } from "@/lib/config/pricing";

type PlanCardProps = {
  plan: MagicPlan;
};

const toneStyles: Record<
  MagicPlan["tone"],
  {
    card: string;
    badge: string;
    button: string;
  }
> = {
  starter: {
    card: "border-[#f0d8d1] bg-[#fff7f4]",
    badge: "bg-[#f7e4de] text-[#9d6473]",
    button: "border-[#24324c]/10 bg-[#24324c] text-white"
  },
  family: {
    card: "border-[#e9d8b1] bg-[#fffaf1]",
    badge: "bg-[#f6ebcb] text-[#8d6b2e]",
    button: "border-[#cda45a]/30 bg-[#cda45a] text-[#24324c]"
  },
  premium: {
    card: "border-[#d9cdea] bg-[#faf6ff]",
    badge: "bg-[#ebe4f5] text-[#6f6292]",
    button: "border-[#8a7bb4]/30 bg-[#8a7bb4] text-white"
  }
};

export function PlanCard({ plan }: PlanCardProps) {
  const styles = toneStyles[plan.tone];

  return (
    <article
      className={`flex h-full flex-col rounded-lg border p-6 shadow-glow ${styles.card} ${
        plan.highlight ? "translate-y-[-6px]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`inline-flex rounded-lg px-3 py-1 text-xs font-medium ${styles.badge}`}>
            {plan.subtitle}
          </p>
          <h2 className="mt-5 text-3xl font-semibold text-[#24324c]">{plan.name}</h2>
        </div>
        {plan.highlight ? (
          <span className="rounded-lg border border-[#e9d8b1] bg-white px-3 py-1 text-xs font-medium text-[#8d6b2e]">
            Популярный
          </span>
        ) : null}
      </div>

      <div className="mt-8 flex items-end gap-2 text-[#24324c]">
        <p className="text-4xl font-semibold">{plan.price}</p>
        <p className="pb-1 text-sm text-[#5b6477]">рублей</p>
      </div>

      <p className="mt-4 text-sm text-[#5b6477]">{plan.stories} персональных сказок</p>
      <p className="mt-3 text-sm leading-7 text-[#5b6477]">{plan.description}</p>

      <button
        type="button"
        disabled
        className={`mt-8 w-full rounded-lg border px-4 py-3 text-sm font-medium ${styles.button}`}
      >
        Скоро подключим оплату
      </button>
    </article>
  );
}
