"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type AccountSummary =
  | {
      user: null;
    }
  | {
      user: {
        displayName: string;
        email: string;
        initials: string;
        subscriptionStatus: string;
      };
    };

type AccountUser = NonNullable<AccountSummary["user"]>;

export function HeaderAuthActions() {
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const pathname = usePathname();
  const isProtected = isProtectedPath(pathname);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        const response = await fetch("/api/account/summary", {
          cache: "no-store",
          signal: AbortSignal.timeout(5000)
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
          setSummary(isProtected ? createFallbackSummary() : { user: null });
        }
      }
    }

    setSummary(isProtected ? createFallbackSummary() : null);
    void loadSummary();

    return () => {
      mounted = false;
    };
  }, [isProtected, pathname]);

  if (!summary) {
    return <PublicAuthLinks />;
  }

  if (!summary.user) {
    return isProtected ? <AuthenticatedLinks /> : <PublicAuthLinks />;
  }

  return <AuthenticatedLinks summary={summary.user} />;
}

function PublicAuthLinks() {
  return (
    <Link
      href="/auth/login"
      className="shrink-0 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--text-main)] transition hover:bg-[var(--surface-secondary)] sm:px-4 sm:text-sm"
    >
      Личный кабинет
    </Link>
  );
}

function AuthenticatedLinks({ summary }: { summary?: AccountUser }) {
  const profileSummary =
    summary ??
    createFallbackSummary().user ?? {
      displayName: "Профиль",
      email: "",
      initials: "MS",
      subscriptionStatus: "free"
    };

  return (
    <Link
      href="/dashboard"
      className="flex shrink-0 items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-soft)] px-2.5 py-1.5 text-[var(--text-main)] transition hover:bg-[var(--surface-secondary)] sm:px-3 sm:py-2"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface-secondary)] text-[0.65rem] font-semibold text-[var(--logo-text)] sm:h-8 sm:w-8 sm:text-xs">
        {profileSummary.initials}
      </span>
      <span className="whitespace-nowrap text-xs font-semibold sm:text-sm">Личный кабинет</span>
    </Link>
  );
}

function isProtectedPath(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  return ["/billing", "/children", "/dashboard", "/series", "/stories"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function createFallbackSummary(
  email?: string | null,
  metadata?: Record<string, unknown> | null
): AccountSummary {
  const fullName = pickString(metadata?.full_name);
  const firstName = pickString(metadata?.first_name);
  const lastName = pickString(metadata?.last_name);
  const displayName =
    fullName || [firstName, lastName].filter(Boolean).join(" ") || email || "Профиль";

  return {
    user: {
      displayName,
      email: email ?? "",
      initials: createInitials(displayName, email),
      subscriptionStatus: "free"
    }
  };
}

function pickString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function createInitials(displayName: string, email?: string | null) {
  const words = displayName
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean);

  if (words.length > 0) {
    return words.slice(0, 2).join("").toUpperCase();
  }

  return (email?.[0] ?? "M").toUpperCase();
}
