import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

const cabinetLinks = [
  { href: "/dashboard", label: "Главная" },
  { href: "/series", label: "Мои сериалы" },
  { href: "/stories", label: "Библиотека" },
  { href: "/children", label: "Профиль ребёнка" },
  { href: "/billing", label: "Тариф и оплата" }
];

export function CabinetSidebar() {
  return (
    <aside className="sticky top-[5.4rem] hidden h-[calc(100vh-5.4rem)] w-60 shrink-0 border-r border-[var(--border-soft)] px-5 py-7 lg:flex lg:flex-col">
      <Link
        href="/series/new"
        className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-[var(--button-dark)] px-4 py-3 text-sm font-semibold text-[var(--button-dark-text)] transition hover:opacity-90"
      >
        Новый сериал
      </Link>

      <nav aria-label="Личный кабинет" className="mt-6 grid gap-1">
        {cabinetLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2.5 text-sm font-medium text-[var(--text-soft)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text-main)]"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <SignOutButton className="mt-auto w-full px-3 py-2.5 text-left text-sm text-[var(--text-muted)] transition hover:text-[var(--text-main)]" />
    </aside>
  );
}
