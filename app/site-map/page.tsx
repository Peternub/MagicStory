import Link from "next/link";

const groups = [
  {
    title: "Публичный сайт",
    links: [
      { href: "/", label: "Главная" },
      { href: "/about", label: "О сервисе" },
      { href: "/pricing", label: "Цены" },
      { href: "/reviews", label: "Отзывы" },
      { href: "/contact", label: "Контакты" }
    ]
  },
  {
    title: "Авторизация",
    links: [
      { href: "/auth/sign-up", label: "Регистрация" },
      { href: "/auth/login", label: "Вход" }
    ]
  },
  {
    title: "Приложение",
    links: [
      { href: "/dashboard", label: "Личный кабинет" },
      { href: "/children", label: "Профили детей" },
      { href: "/stories", label: "Библиотека сказок" },
      { href: "/billing", label: "Тарифы и лимиты" }
    ]
  }
];

export default function SiteMapPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-brand-200">
          Карта сайта
        </p>
        <h1 className="mt-4 font-display text-4xl text-white">
          Все разделы проекта в одном месте
        </h1>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {groups.map((group) => (
          <article
            key={group.title}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-8"
          >
            <h2 className="font-display text-xl text-white">{group.title}</h2>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/70">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
