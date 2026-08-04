import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

type AccountNavigationProps = {
  displayName: string;
  email: string;
  initials: string;
  plan: string;
};

const accountLinks = [
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
    description: "Изменить данные ребенка"
  },
  {
    href: "/billing",
    label: "Тариф и оплата",
    description: "Управление подпиской"
  }
];

export function AccountNavigation({
  displayName,
  email,
  initials,
  plan
}: AccountNavigationProps) {
  return (
    <section className="mt-6 border-y border-[var(--border-soft)] py-5 sm:mt-8 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--logo-text)]">
            {initials}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-[var(--text-main)]">{displayName}</h2>
            <p className="truncate text-sm text-[var(--text-soft)]">{email}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Тариф: {plan}</p>
          </div>
        </div>

        <SignOutButton className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--border-soft)] px-4 py-2.5 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)] sm:w-auto" />
      </div>

      <nav aria-label="Разделы личного кабинета" className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {accountLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] px-4 py-3 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
          >
            <span className="block text-sm font-semibold text-[var(--text-main)]">{item.label}</span>
            <span className="mt-1 block text-xs text-[var(--text-soft)]">{item.description}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
