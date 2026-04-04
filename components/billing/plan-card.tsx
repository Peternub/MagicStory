"use client";

import { useActionState } from "react";
import { createSubscriptionRequest } from "@/app/actions/billing";
import type { SubscriptionPlan } from "@/lib/types/billing";

type BillingActionState = {
  error?: string;
  success?: string;
};

type PlanCardProps = {
  plan: SubscriptionPlan;
  currentPlanCode: string | null;
};

const initialState: BillingActionState = {};

export function PlanCard({ plan, currentPlanCode }: PlanCardProps) {
  const [state, formAction, isPending] = useActionState(
    createSubscriptionRequest,
    initialState
  );

  const isCurrent = currentPlanCode === plan.code;

  return (
    <article className="rounded-[2rem] border border-white/10 bg-[#160a27] p-8 shadow-[0_20px_50px_rgba(9,5,16,0.3)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            {plan.description}
          </p>
        </div>
        {isCurrent ? (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
            Текущий
          </span>
        ) : null}
      </div>

      <div className="mt-8">
        <p className="text-4xl font-semibold text-white">
          {plan.price_rub === 0 ? "Бесплатно" : `${plan.price_rub} ₽`}
        </p>
        <p className="mt-2 text-sm text-white/70">
          Лимит сказок: {plan.stories_limit}
        </p>
      </div>

      <form action={formAction} className="mt-8">
        <input type="hidden" name="planId" value={plan.id} />
        <button
          type="submit"
          disabled={isPending || isCurrent}
          className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isCurrent
            ? "Тариф уже активен"
            : isPending
              ? "Создаем заявку..."
              : "Выбрать тариф"}
        </button>

        {state.error ? (
          <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {state.success}
          </p>
        ) : null}
      </form>
    </article>
  );
}
