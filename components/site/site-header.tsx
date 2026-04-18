import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserDisplayName, getUserInitials } from "@/lib/user/display-name";

const navigation = [
  { href: "/", label: "Главная" },
  { href: "/#pricing", label: "Тарифы" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contact", label: "Связаться" }
];

function formatPlanLabel(status?: string | null) {
  switch (status) {
    case "active":
    case "plus":
      return "Премиум";
    case "free":
    default:
      return "Бесплатный";
  }
}

export async function SiteHeader() {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();
  let profile:
    | {
        subscription_status: string;
      }
    | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    profile = data;
  }

  const displayName = user ? getUserDisplayName(user) : "";
  const initials = user ? getUserInitials(user) : "";

  return (
    <header className="border-b border-[var(--border-soft)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5 sm:px-10">
        <nav className="hidden items-center gap-6 text-sm text-[var(--logo-text)] md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-[var(--logo-text)]"
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
            <details className="group relative">
              <summary className="flex list-none cursor-pointer items-center gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-main)] transition hover:border-[var(--border-strong)] [&::-webkit-details-marker]:hidden">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--logo-text)]">
                  {initials}
                </span>
                <span className="hidden max-w-[12rem] truncate font-medium text-[var(--text-main)] sm:block">
                  {displayName}
                </span>
                <span className="text-[var(--text-muted)] transition group-open:rotate-180">
                  ▾
                </span>
              </summary>

              <div className="absolute right-0 mt-3 w-[19rem] rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-4 shadow-2xl">
                <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">
                    Почта
                  </p>
                  <p className="mt-2 break-all text-sm text-[var(--text-main)]">{user.email}</p>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">
                      Сказки
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--text-main)]">
                      Только текст
                    </p>
                  </div>

                  <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">
                      Тариф
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--text-main)]">
                      {formatPlanLabel(profile?.subscription_status)}
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
                >
                  Открыть кабинет
                </Link>

                <SignOutButton className="mt-3 w-full justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] px-4 py-3 text-sm text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]" />
              </div>
            </details>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg border border-[var(--border-soft)] px-4 py-2 text-sm text-[var(--logo-text)] transition hover:border-[var(--border-strong)] hover:text-[var(--logo-text)]"
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
