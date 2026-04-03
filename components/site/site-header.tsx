import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const navigation = [
  { href: "/", label: "Главная" },
  { href: "/#about", label: "О сервисе" },
  { href: "/#pricing", label: "Цены" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contact", label: "Контакты" }
];

function formatPlanLabel(status?: string | null) {
  switch (status) {
    case "active":
    case "plus":
      return "Магия Плюс";
    case "free":
    default:
      return "Бесплатный";
  }
}

export async function SiteHeader() {
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();
  let profile:
    | {
        stories_balance: number;
        subscription_status: string;
      }
    | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("stories_balance, subscription_status")
      .eq("id", user.id)
      .single();

    profile = data;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08050f]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow">
            <span className="font-display text-sm text-white">MS</span>
          </div>
          <p className="font-display text-sm uppercase tracking-[0.22em] text-brand-200">
            Магические Сказки
          </p>
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm text-white/75">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white/80">
                  Почта: <span className="text-white">{user.email}</span>
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white/80">
                  Сказок осталось:{" "}
                  <span className="text-white">{profile?.stories_balance ?? 0}</span>
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white/80">
                  Тариф:{" "}
                  <span className="text-white">
                    {formatPlanLabel(profile?.subscription_status)}
                  </span>
                </span>
              </div>
              <Link
                href="/dashboard"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-900 transition hover:bg-brand-100"
              >
                Кабинет
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/85 transition hover:border-brand-300 hover:text-white"
              >
                Войти
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:opacity-95"
              >
                Начать бесплатно
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
