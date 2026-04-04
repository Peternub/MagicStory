import Link from "next/link";
import type { MagicPlan } from "@/lib/config/pricing";

type MarketingPlanCardProps = {
  plan: MagicPlan;
};

export function MarketingPlanCard({ plan }: MarketingPlanCardProps) {
  return (
    <article
      className={`flex h-full flex-col rounded-[2rem] border p-6 shadow-glow ${
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
          <span className="rounded-full bg-brand-400/20 px-3 py-1 text-xs font-medium text-brand-100">
            Хит
          </span>
        ) : null}
      </div>

      <h2 className="mt-5 text-lg font-semibold text-white">{plan.name}</h2>
      <p className="mt-4 text-3xl font-semibold text-white">{plan.price} ₽</p>

      <div className="mt-4 space-y-2 text-sm text-white/75">
        <p>До {plan.generations} генераций</p>
        <p>До {plan.minutes} минут</p>
        <p>{plan.hasAudio ? "С озвучкой" : "Без озвучки"}</p>
      </div>

      <p className="mt-5 text-sm leading-7 text-white/70">{plan.description}</p>

      <Link
        href="/auth/sign-up"
        className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-brand-900"
      >
        Начать
      </Link>
    </article>
  );
}
