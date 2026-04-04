import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserDisplayName, getUserInitials } from "@/lib/user/display-name";

const navigation = [
  { href: "/", label: "Главная" },
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
        subscription_status: string;
      }
    | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    profile = data;
  }

  const displayName = user ? getUserDisplayName(user) : "";
  const initials = user ? getUserInitials(user) : "";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08050f]/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-5 px-6 py-4 sm:px-10">
        <Link href="/" className="mr-2 flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow">
            <span className="font-display text-sm text-white">MS</span>
          </div>
          <p className="font-display text-lg tracking-[0.18em] text-white">
            MagicStory
          </p>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 text-sm text-white/75 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-4 py-2 transition hover:bg-brand-500/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {user ? (
            <details className="group relative">
              <summary className="flex list-none cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-[#120a1d] px-3 py-2 text-sm text-white/90 transition hover:border-brand-300 hover:bg-brand-500/10 [&::-webkit-details-marker]:hidden">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-xs font-semibold text-white shadow-glow">
                  {initials}
                </span>
                <span className="max-w-[12rem] truncate font-medium text-white">
                  {displayName}
                </span>
                <span className="text-white/40 transition group-open:rotate-180">
                  ▾
                </span>
              </summary>

              <div className="absolute right-0 mt-3 w-[20rem] rounded-[1.5rem] border border-white/10 bg-[#120a1d] p-4 shadow-2xl">
                <div className="rounded-2xl border border-white/10 bg-[#160a27] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-200">
                    Почта
                  </p>
                  <p className="mt-2 break-all text-sm text-white">{user.email}</p>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#160a27] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-200">
                      Сказки
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">Без лимита</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#160a27] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-200">
                      Тариф
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatPlanLabel(profile?.subscription_status)}
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:border-brand-300 hover:bg-brand-500/10"
                >
                  Открыть кабинет
                </Link>

                <SignOutButton className="mt-3 w-full justify-center border border-white/10 bg-[#160a27] px-4 py-3 text-sm text-white transition hover:border-brand-300 hover:bg-brand-500/10" />
              </div>
            </details>
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
