"use client";

import { useMemo, useState } from "react";
import { PlanCard } from "@/components/billing/plan-card";
import { MarketingPlanCard } from "@/components/site/marketing-plan-card";
import {
  getMagicPlans,
  tariffModels,
  tariffTabs,
  type MagicPlanCategory,
  type MagicPlanModel
} from "@/lib/config/pricing";

type PricingTabsProps = {
  variant?: "marketing" | "billing";
};

export function PricingTabs({ variant = "marketing" }: PricingTabsProps) {
  const [category, setCategory] = useState<MagicPlanCategory>("stories");
  const [model, setModel] = useState<MagicPlanModel>("plus");
  const plans = useMemo(() => getMagicPlans(category, model), [category, model]);
  const Card = variant === "billing" ? PlanCard : MarketingPlanCard;

  return (
    <div className="space-y-8">
      <div className="mx-auto grid max-w-xl grid-cols-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-1">
        {tariffTabs.map((tab) => {
          const isActive = category === tab.code;

          return (
            <button
              key={tab.code}
              type="button"
              onClick={() => setCategory(tab.code)}
              className={`rounded-md px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[var(--button-dark)] text-[var(--button-dark-text)] shadow-glow"
                  : "text-[var(--text-soft)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-main)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto grid max-w-3xl gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-2 sm:grid-cols-2">
        {tariffModels.map((item) => {
          const isActive = model === item.code;

          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setModel(item.code)}
              className={`rounded-md border px-4 py-4 text-left transition ${
                isActive
                  ? item.code === "business"
                    ? "border-[var(--accent-gold)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--accent-gold)_22%,var(--surface-card)),var(--surface-card-alt))] text-[var(--text-main)] shadow-glow"
                    : "border-[var(--border-strong)] bg-[var(--surface-card-alt)] text-[var(--text-main)]"
                  : "border-transparent text-[var(--text-soft)] hover:border-[var(--border-soft)] hover:bg-[var(--surface-soft)]"
              }`}
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="mt-2 block text-xs leading-5 text-[var(--text-soft)]">
                {item.description}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`grid gap-6 ${
          plans.length === 4 ? "lg:grid-cols-2 xl:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        {plans.map((plan) => (
          <Card key={plan.code} plan={plan} />
        ))}
      </div>
    </div>
  );
}
