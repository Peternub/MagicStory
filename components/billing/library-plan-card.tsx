import Link from "next/link";
import { libraryPlan } from "@/lib/config/pricing";

type LibraryPlanCardProps = {
  variant: "marketing" | "billing";
};

export function LibraryPlanCard({ variant }: LibraryPlanCardProps) {
  return (
    <article
      className="flex h-full flex-col rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-6"
      style={{ boxShadow: "var(--glow-shadow)" }}
    >
      <div>
        <p className="inline-flex rounded-lg bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-[var(--logo-text)]">
          {libraryPlan.subtitle}
        </p>
        <h2 className="mt-5 text-3xl font-semibold text-[var(--text-main)]">
          {libraryPlan.name}
        </h2>
      </div>

      <div className="mt-8 flex items-end gap-2 text-[var(--text-main)]">
        <p className="text-4xl font-semibold">{libraryPlan.priceMonthly}</p>
        <p className="pb-1 text-sm text-[var(--text-soft)]">₽/месяц</p>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-[var(--text-soft)]">
        {libraryPlan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="text-[var(--logo-text)]" aria-hidden="true">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {variant === "marketing" ? (
        <Link
          href="/auth/sign-up"
          className="mt-auto inline-flex items-center justify-center rounded-lg bg-[var(--button-light)] px-5 py-3 text-sm font-medium text-[var(--button-light-text)] transition hover:opacity-90"
        >
          Выбрать
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-auto rounded-lg border border-[var(--border-soft)] bg-[var(--button-light)] px-4 py-3 text-sm font-medium text-[var(--button-light-text)]"
        >
          Скоро подключим оплату
        </button>
      )}
    </article>
  );
}
