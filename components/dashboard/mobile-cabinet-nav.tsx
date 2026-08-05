"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const mobileLinks = [
  { href: "/dashboard", label: "Главная" },
  { href: "/series", label: "Сериалы" },
  { href: "/stories", label: "Библиотека" },
  { href: "/children", label: "Профиль" }
];

export function MobileCabinetNav() {
  const pathname = usePathname();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      {isCreateOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end bg-black/55 lg:hidden">
          <button
            type="button"
            aria-label="Закрыть меню создания"
            className="absolute inset-0"
            onClick={() => setIsCreateOpen(false)}
          />
          <section className="relative z-10 w-full rounded-t-lg border-t border-[var(--border-soft)] bg-[var(--surface-primary)] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <h2 className="text-lg font-semibold text-[var(--text-main)]">Что создать?</h2>
            <div className="mt-4 grid gap-2">
              <Link
                href="/series"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg border border-[var(--border-soft)] px-4 py-3 text-sm font-semibold text-[var(--text-main)]"
              >
                Новую серию
              </Link>
              <Link
                href="/series/new"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg bg-[var(--button-dark)] px-4 py-3 text-center text-sm font-semibold text-[var(--button-dark-text)]"
              >
                Новый сериал
              </Link>
            </div>
          </section>
        </div>
      ) : null}

      <nav
        aria-label="Мобильная навигация кабинета"
        className="fixed inset-x-0 bottom-0 z-[70] grid grid-cols-5 border-t border-[var(--border-soft)] bg-[var(--header-bg)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        {mobileLinks.slice(0, 2).map((item) => (
          <MobileLink key={item.href} item={item} pathname={pathname} />
        ))}
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-[var(--logo-text)]"
        >
          <span aria-hidden="true" className="text-xl leading-none">+</span>
          Создать
        </button>
        {mobileLinks.slice(2).map((item) => (
          <MobileLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>
    </>
  );
}

function MobileLink({
  item,
  pathname
}: {
  item: (typeof mobileLinks)[number];
  pathname: string;
}) {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-16 items-center justify-center px-1 text-center text-[0.7rem] font-medium transition ${
        isActive ? "text-[var(--logo-text)]" : "text-[var(--text-muted)]"
      }`}
    >
      {item.label}
    </Link>
  );
}
