"use client";

import { PlanCard } from "@/components/billing/plan-card";
import { LibraryPlanCard } from "@/components/billing/library-plan-card";
import { MarketingPlanCard } from "@/components/site/marketing-plan-card";
import { magicPlans } from "@/lib/config/pricing";

type PricingTabsProps = {
  variant?: "marketing" | "billing";
};

export function PricingTabs({ variant = "marketing" }: PricingTabsProps) {
  const Card = variant === "billing" ? PlanCard : MarketingPlanCard;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <LibraryPlanCard variant={variant} />
      {magicPlans.map((plan) => (
        <Card key={plan.code} plan={plan} />
      ))}
    </div>
  );
}
