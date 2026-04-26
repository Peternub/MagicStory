"use client";

import { PlanCard } from "@/components/billing/plan-card";
import { MarketingPlanCard } from "@/components/site/marketing-plan-card";
import { magicPlans } from "@/lib/config/pricing";

type PricingTabsProps = {
  variant?: "marketing" | "billing";
};

export function PricingTabs({ variant = "marketing" }: PricingTabsProps) {
  const Card = variant === "billing" ? PlanCard : MarketingPlanCard;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {magicPlans.map((plan) => (
        <Card key={plan.code} plan={plan} />
      ))}
    </div>
  );
}
