"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";

type ProfileMenuProps = {
  displayName: string;
  email: string;
  initials: string;
  storiesBalance: number;
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
  storiesBalance,
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
    <div ref={rootRef} className="relative z-[70]">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-main)] transition hover:border-[var(--border-strong)]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--logo-text)]">
          {initials}
        </span>
        <span className="hidden max-w-[12rem] truncate font-medium text-[var(--text-main)] sm:block">
          {displayName}
        </span>
        <span
          className={`text-[var(--text-muted)] transition ${isOpen ? "rotate-180" : ""}`}
        >
          ▾
        </span>
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
                Лимиты
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-main)]">
                {storiesBalance}
              </p>
              <p className="mt-1 text-xs text-[var(--text-soft)]">сказок осталось</p>
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

          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-[var(--border-soft)] px-4 py-3 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
          >
            Открыть кабинет
          </Link>

          <SignOutButton className="mt-3 w-full justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] px-4 py-3 text-sm text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]" />
        </div>
      ) : null}
    </div>
  );
}
