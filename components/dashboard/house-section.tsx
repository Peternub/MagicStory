import type { ReactNode } from "react";
import Link from "next/link";

type HouseSectionProps = {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  eyebrow: string;
  room: "cinema" | "gallery" | "study";
  title: string;
};

export function HouseSection({
  actions,
  children,
  description,
  title
}: HouseSectionProps) {
  return (
    <main className="account-section">
      <div className="account-section__glow" aria-hidden="true" />
      <div className="account-section__workspace">
        <header className="account-section__header">
          <div className="account-section__heading">
            <Link href="/dashboard" className="account-section__back-link">
              ← В кабинет
            </Link>
            <p>MagicStory</p>
            <h1>{title}</h1>
            {description ? <div>{description}</div> : null}
          </div>
          {actions ? <div className="account-section__actions">{actions}</div> : null}
        </header>

        <div className="account-section__body">{children}</div>
      </div>
    </main>
  );
}
