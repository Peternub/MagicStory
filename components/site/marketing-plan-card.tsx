import Link from "next/link";

type MarketingPlanCardProps = {
  name: string;
  price: string;
  limit: string;
  description: string;
  highlight?: boolean;
};

export function MarketingPlanCard({
  name,
  price,
  limit,
  description,
  highlight = false
}: MarketingPlanCardProps) {
  return (
    <article
      className={`rounded-[2rem] border p-8 shadow-glow ${
        highlight
          ? "border-brand-400/60 bg-gradient-to-b from-brand-800/60 to-[#0d0816]"
          : "border-white/10 bg-[#160a27]"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl text-white">{name}</h2>
        {highlight ? (
          <span className="rounded-full bg-brand-400/20 px-3 py-1 text-xs font-medium text-brand-100">
            Популярный
          </span>
        ) : null}
      </div>
      <p className="mt-6 text-4xl font-semibold text-white">{price}</p>
      <p className="mt-2 text-sm text-brand-100/70">{limit}</p>
      <p className="mt-5 text-sm leading-7 text-white/70">{description}</p>
      <Link
        href="/auth/sign-up"
        className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-brand-900"
      >
        Начать
      </Link>
    </article>
  );
}
