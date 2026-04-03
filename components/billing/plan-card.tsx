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
    <article className="rounded-[2rem] border border-brand-200/70 bg-white/90 p-8 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-brand-900">{plan.name}</h2>
          <p className="mt-2 text-sm leading-6 text-brand-900/70">
            {plan.description}
          </p>
        </div>
        {isCurrent ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            Текущий
          </span>
        ) : null}
      </div>

      <div className="mt-8">
        <p className="text-4xl font-semibold text-brand-900">
          {plan.price_rub === 0 ? "Бесплатно" : `${plan.price_rub} ₽`}
        </p>
        <p className="mt-2 text-sm text-brand-900/70">
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
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {state.success}
          </p>
        ) : null}
      </form>
    </article>
  );
}
