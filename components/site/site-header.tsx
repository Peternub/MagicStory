import Link from "next/link";
import { ProfileMenu } from "@/components/site/profile-menu";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { getUserSummary } from "@/lib/account/user-summary";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getUserDisplayName, getUserInitials } from "@/lib/user/display-name";

const navigation = [
  { href: "/", label: "Главная" },
  { href: "/#pricing", label: "Тарифы" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contact", label: "Связаться" }
];

export async function SiteHeader() {
  const user = await getCurrentUser();
  const summary = user ? await getUserSummary(user.id) : null;
  const displayName = user ? getUserDisplayName(user) : "";
  const initials = user ? getUserInitials(user) : "";

  return (
    <header className="sticky top-0 z-[60] border-b border-[var(--border-soft)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5 sm:px-10">
        <nav className="hidden items-center gap-6 text-sm text-[var(--logo-text)] md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-[var(--text-main)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="flex items-center gap-3 text-[var(--logo-text)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface-soft)] text-sm font-semibold">
            MS
          </span>
          <span className="font-display text-lg tracking-[0.24em]">MagicStory</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <>
              <Link
                href="/stories/new"
                className="rounded-lg bg-[var(--button-dark)] px-4 py-2 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90"
              >
                Создать сказку
              </Link>

              <ProfileMenu
                displayName={displayName}
                email={user.email ?? ""}
                initials={initials}
                storiesBalance={summary?.storiesBalance ?? 0}
                subscriptionStatus={summary?.subscriptionStatus ?? "free"}
              />
            </>
          ) : (
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
          )}
        </div>
      </div>
    </header>
  );
}
