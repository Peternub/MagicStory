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
  standard: {
    card: "border-[var(--border-strong)] bg-[var(--surface-card-alt)]",
    badge: "bg-[var(--surface-soft)] text-[var(--logo-text)]",
    button: "border-[var(--border-soft)] bg-[var(--button-light)] text-[var(--button-light-text)]"
  },
  premium: {
    card:
      "border-[var(--accent-gold)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--surface-card-alt)_86%,transparent),color-mix(in_srgb,var(--accent-gold)_14%,var(--surface-card)))] ring-1 ring-[var(--accent-gold-soft)]",
    badge: "bg-[var(--accent-gold)] text-[var(--button-dark-text)]",
    button:
      "border-[var(--accent-gold)] bg-[var(--accent-gold)] text-[var(--button-dark-text)]"
  }
};

export function PlanCard({ plan }: PlanCardProps) {
  const styles = toneStyles[plan.tone];

  return (
    <article
      className={`billing-plan-folder flex h-full flex-col border p-5 sm:p-6 ${styles.card}`}
      style={{
        boxShadow:
          plan.tone === "premium"
            ? "var(--glow-shadow), 0 0 34px color-mix(in srgb, var(--accent-gold) 16%, transparent)"
            : "var(--glow-shadow)"
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles.badge}`}>
            {plan.subtitle}
          </p>
          <h2 className="mt-5 text-2xl font-semibold text-[var(--text-main)] sm:text-3xl">
            {plan.name}
          </h2>
        </div>
        {plan.highlight ? (
          <span className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent-gold)]">
            Популярный
          </span>
        ) : null}
      </div>

      <div className="mt-7 flex items-end gap-2 text-[var(--text-main)]">
        <p className="text-4xl font-semibold">{plan.priceMonthly}</p>
        <p className="pb-1 text-sm text-[var(--text-soft)]">₽/месяц</p>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-[var(--text-soft)]">
        {plan.features.slice(0, 2).map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="text-[var(--logo-text)]" aria-hidden="true">
              •
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled
        className={`mt-8 w-full rounded-xl border px-4 py-3 text-sm font-medium ${styles.button}`}
      >
        Выбор тарифа скоро
      </button>
    </article>
  );
}
