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
    <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2 md:gap-6">
      {magicPlans.map((plan) => (
        <Card key={plan.code} plan={plan} />
      ))}
    </div>
  );
}
