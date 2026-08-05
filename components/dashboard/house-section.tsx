import type { ReactNode } from "react";
import Link from "next/link";

type AccountPageShellProps = {
  actions?: ReactNode;
  children: ReactNode;
  title: string;
};

export function AccountPageShell({ actions, children, title }: AccountPageShellProps) {
  return (
    <main className="account-page">
      <div className="account-page__container">
        <Link href="/dashboard" className="account-page__back-link">
          ← На главный экран
        </Link>

        <header className="account-page__header">
          <h1>{title}</h1>
          {actions ? <div className="account-page__actions">{actions}</div> : null}
        </header>

        <div className="account-page__body">{children}</div>
      </div>
    </main>
  );
}
