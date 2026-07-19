"use client";

import Link from "next/link";
import { ChevronDown, LayoutDashboard, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";

type ProfileMenuProps = {
  displayName: string;
  email: string;
  initials: string;
  subscriptionStatus: string;
};

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

export function ProfileMenu({
  displayName,
  email,
  initials,
  subscriptionStatus
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={rootRef} data-profile-menu className="relative z-[70]">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Открыть меню профиля"
        className="flex items-center gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-main)] transition hover:border-[var(--border-strong)]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--logo-text)]">
          {initials}
        </span>
        <span className="hidden max-w-[12rem] truncate font-medium text-[var(--text-main)] 2xl:block">
          {displayName}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={16}
          className={`text-[var(--text-muted)] transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 mt-3 w-[19rem] rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-4"
          style={{ boxShadow: "var(--glow-shadow)" }}
        >
          <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">
              Почта
            </p>
            <p className="mt-2 break-all text-sm text-[var(--text-main)]">{email}</p>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">
                Серии
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-main)]">
                Без ограничений
              </p>
              <p className="mt-1 text-xs text-[var(--text-soft)]">в пробном периоде</p>
            </div>

            <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">
                Тариф
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-main)]">
                {formatPlanLabel(subscriptionStatus)}
              </p>
            </div>
          </div>

          <nav aria-label="Меню профиля" className="mt-3 grid gap-2">
            <Link
              href="/children"
              onClick={() => setIsOpen(false)}
              className="inline-flex w-full items-center gap-3 rounded-lg border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
            >
              <UserRound aria-hidden="true" size={17} strokeWidth={1.8} />
              Профили детей
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="inline-flex w-full items-center gap-3 rounded-lg border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
            >
              <LayoutDashboard aria-hidden="true" size={17} strokeWidth={1.8} />
              Кабинет
            </Link>
          </nav>

          <SignOutButton className="mt-3 w-full justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] px-4 py-3 text-sm text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]" />
        </div>
      ) : null}
    </div>
  );
}
