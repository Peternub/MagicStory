"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ProfileMenu } from "@/components/site/profile-menu";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

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

type AccountUser = NonNullable<AccountSummary["user"]>;

export function HeaderAuthActions() {
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const pathname = usePathname();
  const isProtected = isProtectedPath(pathname);

  useEffect(() => {
    let mounted = true;
    const supabase = createSupabaseBrowserClient();

    async function loadSummary() {
      let hasLocalSession = false;

      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        hasLocalSession = Boolean(session?.user);

        if (mounted && session?.user) {
          setSummary(createFallbackSummary(session.user.email, session.user.user_metadata));
        }

        if (!session?.user && !isProtected) {
          if (mounted) {
            setSummary({ user: null });
          }
          return;
        }

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
        if (mounted && !hasLocalSession) {
          setSummary({ user: null });
        }
      }
    }

    setSummary(isProtected ? createFallbackSummary() : null);
    void loadSummary();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) {
        return;
      }

      setSummary(
        session?.user
          ? createFallbackSummary(session.user.email, session.user.user_metadata)
          : { user: null }
      );
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
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

function AuthenticatedLinks({ summary }: { summary?: AccountUser }) {
  const profileSummary =
    summary ??
    createFallbackSummary().user ?? {
      displayName: "Профиль",
      email: "",
      initials: "MS",
      storiesBalance: 0,
      subscriptionStatus: "free"
    };

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
        href="/series/new"
        className="shrink-0 whitespace-nowrap rounded-lg bg-[var(--button-dark)] px-3 py-2 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90 sm:px-4"
      >
        Создать сериал
      </Link>

      <ProfileMenu
        displayName={profileSummary.displayName}
        email={profileSummary.email}
        initials={profileSummary.initials}
        storiesBalance={profileSummary.storiesBalance}
        subscriptionStatus={profileSummary.subscriptionStatus}
      />
    </>
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
      storiesBalance: 0,
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
