import Link from "next/link";

const productLinks = [
  { href: "/", label: "Главная" },
  { href: "/#pricing", label: "Тарифы" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contact", label: "Связаться" }
];

const appLinks = [
  { href: "/dashboard", label: "Кабинет" },
  { href: "/children", label: "Дети" },
  { href: "/stories", label: "Сказки" },
  { href: "/billing", label: "Подписка" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#edd7cf] bg-[#fff8f4] text-[#24324c]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1.15fr_0.85fr_0.85fr_1fr]">
        <div>
          <p className="font-display text-lg tracking-[0.18em] text-[#24324c]">
            MagicStory
          </p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[#5b6477]">
            Персональные сказки, которые превращают обычный вечер в маленькое чудо.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#b78397]">
            Навигация
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#5b6477]">
            {productLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[#24324c]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#b78397]">
            Приложение
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#5b6477]">
            {appLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[#24324c]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#b78397]">
            Связь
          </p>
          <div className="mt-4 space-y-3 text-sm text-[#5b6477]">
            <p>На главной странице есть форма для любых вопросов.</p>
            <Link href="/#contact" className="inline-flex text-[#24324c] hover:text-[#b78397]">
              Перейти к форме
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
