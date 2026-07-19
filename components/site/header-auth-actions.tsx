"use client";

import Link from "next/link";
import { BookOpen, FilePlus2, Plus, UserRound } from "lucide-react";
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
        className="hidden rounded-lg border border-[var(--border-soft)] px-4 py-2 text-sm text-[var(--logo-text)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-main)] sm:inline-flex"
      >
        Войти
      </Link>
      <Link
        href="/auth/sign-up"
        className="rounded-lg bg-[var(--button-dark)] px-3 py-2 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90 sm:px-4"
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
      subscriptionStatus: "free"
    };

  return (
    <>
      <nav
        aria-label="Разделы приложения"
        data-app-navigation
        className="grid w-full grid-cols-2 gap-1 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] p-1 sm:flex sm:w-auto sm:items-center"
      >
        <Link
          href="/stories"
          aria-label="Библиотека"
          title="Библиотека"
          className="inline-flex h-10 items-center justify-start gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium text-[var(--text-main)] transition hover:bg-[var(--surface-secondary)] sm:justify-center"
        >
          <BookOpen aria-hidden="true" size={17} strokeWidth={1.8} />
          <span>Библиотека</span>
        </Link>

        <Link
          href="/series"
          aria-label="Создать новую серию"
          title="Создать новую серию"
          className="inline-flex h-10 items-center justify-start gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium text-[var(--text-main)] transition hover:bg-[var(--surface-secondary)] sm:justify-center"
        >
          <FilePlus2 aria-hidden="true" size={18} strokeWidth={1.9} />
          <span>Новая серия</span>
        </Link>

        <Link
          href="/series/new"
          aria-label="Создать сериал"
          title="Создать сериал"
          className="inline-flex h-10 items-center justify-start gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium text-[var(--text-main)] transition hover:bg-[var(--surface-secondary)] sm:justify-center"
        >
          <Plus aria-hidden="true" size={18} strokeWidth={2} />
          <span>Создать сериал</span>
        </Link>

        <Link
          href="/children"
          aria-label="Профиль ребёнка"
          title="Профиль ребёнка"
          className="inline-flex h-10 items-center justify-start gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium text-[var(--text-main)] transition hover:bg-[var(--surface-secondary)] sm:justify-center"
        >
          <UserRound aria-hidden="true" size={18} strokeWidth={1.8} />
          <span>Профиль ребёнка</span>
        </Link>
      </nav>

      <ProfileMenu
        displayName={profileSummary.displayName}
        email={profileSummary.email}
        initials={profileSummary.initials}
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
