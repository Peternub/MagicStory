import Link from "next/link";
import { HeaderAuthActions } from "@/components/site/header-auth-actions";
import { ThemeToggle } from "@/components/site/theme-toggle";

const navigation = [
  { href: "/", label: "Главная" },
  { href: "/#pricing", label: "Тарифы" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contact", label: "Связаться" }
];

export function SiteHeader() {
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

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <HeaderAuthActions />
        </div>
      </div>
    </header>
  );
}
