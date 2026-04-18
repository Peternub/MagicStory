import Link from "next/link";
import type { MagicPlan } from "@/lib/config/pricing";

type MarketingPlanCardProps = {
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
    card: "border-[var(--border-soft)] bg-[var(--surface-card)]",
    badge: "bg-[var(--surface-soft)] text-[var(--logo-text)]",
    button: "bg-[var(--button-light)] text-[var(--button-light-text)] hover:opacity-90"
  },
  family: {
    card: "border-[var(--border-strong)] bg-[var(--surface-card-alt)]",
    badge: "bg-[var(--accent-gold-soft)] text-[var(--accent-gold)]",
    button: "bg-[var(--button-dark)] text-[var(--button-dark-text)] hover:opacity-90"
  },
  premium: {
    card: "border-[var(--border-soft)] bg-[var(--surface-card)]",
    badge: "bg-[var(--accent-lavender-soft)] text-[var(--accent-lavender)]",
    button: "bg-[var(--accent-lavender)] text-white hover:opacity-90"
  }
};

export function MarketingPlanCard({ plan }: MarketingPlanCardProps) {
  const styles = toneStyles[plan.tone];

  return (
    <article
      className={`flex h-full flex-col rounded-lg border p-6 shadow-glow ${styles.card} ${
        plan.highlight ? "translate-y-[-6px]" : ""
      }`}
      style={{ boxShadow: "var(--glow-shadow)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`inline-flex rounded-lg px-3 py-1 text-xs font-medium ${styles.badge}`}>
            {plan.subtitle}
          </p>
          <h2 className="mt-5 text-3xl font-semibold text-[var(--text-main)]">{plan.name}</h2>
        </div>
        {plan.highlight ? (
          <span className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-gold)]">
            Выгодно
          </span>
        ) : null}
      </div>

      <div className="mt-8 flex items-end gap-2 text-[var(--text-main)]">
        <p className="text-4xl font-semibold">{plan.price}</p>
        <p className="pb-1 text-sm text-[var(--text-soft)]">рублей</p>
      </div>

      <p className="mt-4 text-sm text-[var(--text-soft)]">{plan.stories} персональных сказок</p>
      <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">{plan.description}</p>

      <Link
        href="/auth/sign-up"
        className={`mt-8 inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium transition ${styles.button}`}
      >
        Выбрать
      </Link>
    </article>
  );
}
