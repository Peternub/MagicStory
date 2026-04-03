import Link from "next/link";

const productLinks = [
  { href: "/", label: "Главная" },
  { href: "/#about", label: "О сервисе" },
  { href: "/#pricing", label: "Цены" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contact", label: "Контакты" },
  { href: "/#site-map", label: "Карта сайта" }
];

const appLinks = [
  { href: "/dashboard", label: "Кабинет" },
  { href: "/children", label: "Профили детей" },
  { href: "/stories", label: "Библиотека сказок" },
  { href: "/billing", label: "Подписка" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#06040d]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <p className="font-display text-lg text-white">Магические Сказки</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
            Онлайн-сервис для родителей, который превращает сложные детские
            ситуации в персональные истории с текстом и аудио.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-brand-200">
            Навигация
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
            {productLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-brand-200">
            Приложение
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
            {appLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-brand-200">
            Связь
          </p>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <p>Форма обратной связи находится на главной странице ниже.</p>
            <Link href="/#contact" className="inline-flex text-white hover:text-brand-200">
              Перейти к контактам
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
