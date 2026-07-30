"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";

type ProfileMenuProps = {
  displayName: string;
  email: string;
  initials: string;
  subscriptionStatus: string;
};

const accountLinks = [
  {
    href: "/dashboard",
    label: "Главная кабинета",
    description: "Профиль и последние серии"
  },
  {
    href: "/series/new",
    label: "Создать сериал",
    description: "Начать новую историю"
  },
  {
    href: "/series",
    label: "Мои сериалы",
    description: "Продолжить созданные истории"
  },
  {
    href: "/stories",
    label: "Библиотека",
    description: "Все готовые серии"
  },
  {
    href: "/children",
    label: "Профиль ребенка",
    description: "Добавить или изменить данные"
  },
  {
    href: "/billing",
    label: "Тариф и оплата",
    description: "Управление подпиской"
  }
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
    <div ref={rootRef} className="relative z-[70]">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-soft)] px-2.5 py-1.5 text-sm text-[var(--text-main)] transition hover:bg-[var(--surface-secondary)] sm:px-3 sm:py-2"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--surface-secondary)] text-[0.65rem] font-semibold text-[var(--logo-text)] sm:h-8 sm:w-8 sm:text-xs">
          {initials}
        </span>
        <span className="whitespace-nowrap text-xs font-semibold sm:text-sm">Личный кабинет</span>
        <span
          aria-hidden="true"
          className={`text-xs text-[var(--text-muted)] transition ${isOpen ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-3 sm:p-4"
          style={{ boxShadow: "var(--glow-shadow)" }}
        >
          <div className="flex items-center gap-3 border-b border-[var(--border-soft)] px-1 pb-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--logo-text)]">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-main)]">
                {displayName}
              </p>
              <p className="mt-0.5 truncate text-xs text-[var(--text-soft)]">{email}</p>
            </div>
          </div>

          <nav className="mt-3 grid gap-1">
            {accountLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-2.5 transition hover:bg-[var(--surface-secondary)]"
              >
                <span className="block text-sm font-medium text-[var(--text-main)]">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--text-soft)]">
                  {item.description}
                </span>
              </Link>
            ))}
          </nav>

          <p className="mt-3 border-t border-[var(--border-soft)] px-3 pt-3 text-xs text-[var(--text-soft)]">
            Тариф:{" "}
            <span className="font-medium text-[var(--text-main)]">
              {formatPlanLabel(subscriptionStatus)}
            </span>
          </p>

          <SignOutButton className="mt-3 w-full justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] px-4 py-2.5 text-sm text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]" />
        </div>
      ) : null}
    </div>
  );
}
