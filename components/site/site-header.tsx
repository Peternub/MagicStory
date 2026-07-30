import Link from "next/link";
import { HeaderAuthActions } from "@/components/site/header-auth-actions";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-[60] border-b border-[var(--border-soft)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-10 lg:py-5">
        <Link href="/" className="flex shrink-0 items-center gap-3 text-[var(--logo-text)]">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface-soft)] text-xs font-semibold sm:h-10 sm:w-10 sm:text-sm">
            MS
          </span>
          <span className="font-display text-sm tracking-[0.16em] sm:text-lg sm:tracking-[0.24em]">
            MagicStory
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <HeaderAuthActions />
        </div>
      </div>
    </header>
  );
}
