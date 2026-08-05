"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderAuthActions } from "@/components/site/header-auth-actions";

const siteLinks = [
  { href: "/", label: "Главная" },
  { href: "/pricing", label: "Цены" },
  { href: "/about", label: "О сервисе" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contact", label: "Связаться" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const isCabinet = ["/billing", "/children", "/dashboard", "/series", "/stories"].some(
    (root) => pathname === root || pathname.startsWith(`${root}/`)
  );

  return (
    <header className="sticky top-0 z-[60] border-b border-[var(--border-soft)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-10 lg:py-5">
        <Link href={isCabinet ? "/dashboard" : "/"} className="flex shrink-0 items-center gap-3 text-[var(--logo-text)]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface-soft)] text-xs font-semibold sm:h-10 sm:w-10 sm:text-sm">
            MS
          </span>
          <span className="font-display text-sm tracking-[0.16em] sm:text-lg sm:tracking-[0.24em]">
            MagicStory
          </span>
        </Link>

        {!isCabinet ? (
          <nav aria-label="Основная навигация" className="ml-5 hidden items-center gap-1 lg:flex">
            {siteLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-[var(--text-soft)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text-main)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <HeaderAuthActions />
        </div>
      </div>
    </header>
  );
}
