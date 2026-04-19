import Link from "next/link";

const productLinks = [
  { href: "/", label: "Главная" },
  { href: "/#pricing", label: "Тарифы" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contact", label: "Связаться" }
];

const appLinks = [
  { href: "/dashboard", label: "Кабинет" },
  { href: "/stories/new", label: "Создать сказку" },
  { href: "/stories", label: "Библиотека" },
  { href: "/billing", label: "Подписка" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border-soft)] bg-[var(--footer-bg)] text-[var(--text-main)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1.15fr_0.85fr_0.85fr_1fr]">
        <div>
          <p className="font-display text-lg tracking-[0.18em] text-[var(--logo-text)]">
            MagicStory
          </p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-soft)]">
            Персональные сказки, которые превращают обычный вечер в маленькое чудо.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--logo-text)]">
            Навигация
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--text-soft)]">
            {productLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[var(--logo-text)]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--logo-text)]">
            Приложение
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--text-soft)]">
            {appLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[var(--logo-text)]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--logo-text)]">
            Связь
          </p>
          <div className="mt-4 space-y-3 text-sm text-[var(--text-soft)]">
            <p>На главной странице есть форма для любых вопросов.</p>
            <Link
              href="/#contact"
              className="inline-flex text-[var(--logo-text)] hover:text-[var(--accent-gold)]"
            >
              Перейти к форме
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
