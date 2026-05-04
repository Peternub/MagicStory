"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ProfileMenu } from "@/components/site/profile-menu";

type AccountSummary =
  | {
      user: null;
    }
  | {
      user: {
        displayName: string;
        email: string;
        initials: string;
        storiesBalance: number;
        subscriptionStatus: string;
      };
    };

export function HeaderAuthActions() {
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    setSummary(null);

    async function loadSummary() {
      try {
        const response = await fetch("/api/account/summary", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("ACCOUNT_SUMMARY_FAILED");
        }

        const data = (await response.json()) as AccountSummary;

        if (mounted) {
          setSummary(data);
        }
      } catch {
        if (mounted) {
          setSummary({ user: null });
        }
      }
    }

    void loadSummary();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  if (!summary) {
    return <div className="h-10 w-36 rounded-lg bg-[var(--surface-soft)]" aria-hidden="true" />;
  }

  if (!summary.user) {
    return (
      <>
        <Link
          href="/auth/login"
          className="rounded-lg border border-[var(--border-soft)] px-4 py-2 text-sm text-[var(--logo-text)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-main)]"
        >
          Войти
        </Link>
        <Link
          href="/auth/sign-up"
          className="rounded-lg bg-[var(--button-dark)] px-4 py-2 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90"
        >
          Начать
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/children"
        className="shrink-0 whitespace-nowrap rounded-lg border border-[var(--border-soft)] px-3 py-2 text-sm font-medium text-[var(--logo-text)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-main)] sm:px-4"
      >
        <span className="hidden sm:inline">Профиль ребенка</span>
        <span className="sm:hidden">Дети</span>
      </Link>

      <Link
        href="/stories/new"
        className="shrink-0 whitespace-nowrap rounded-lg bg-[var(--button-dark)] px-3 py-2 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90 sm:px-4"
      >
        Создать сказку
      </Link>

      <ProfileMenu
        displayName={summary.user.displayName}
        email={summary.user.email}
        initials={summary.user.initials}
        storiesBalance={summary.user.storiesBalance}
        subscriptionStatus={summary.user.subscriptionStatus}
      />
    </>
  );
}
