import Link from "next/link";
import { HeaderAuthActions } from "@/components/site/header-auth-actions";

const navigation = [
  { href: "/", label: "Главная" },
  { href: "/#pricing", label: "Тарифы" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contact", label: "Связаться" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-[60] border-b border-[var(--border-soft)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4 sm:px-6 lg:px-10">
        <nav className="col-start-1 row-start-1 hidden items-center gap-6 text-sm text-[var(--logo-text)] lg:flex">
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

        <Link
          href="/"
          className="col-start-1 row-start-1 flex items-center gap-3 justify-self-center text-[var(--logo-text)] lg:col-start-2"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface-soft)] text-sm font-semibold">
            MS
          </span>
          <span className="hidden font-display text-lg tracking-[0.24em] sm:inline">
            MagicStory
          </span>
        </Link>

        <div className="col-start-3 row-start-1 flex min-w-0 items-center justify-self-end gap-2 sm:gap-3">
          <HeaderAuthActions />
        </div>
      </div>
    </header>
  );
}
