import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserDisplayName, getUserInitials } from "@/lib/user/display-name";

const navigation = [
  { href: "/", label: "Главная" },
  { href: "/#pricing", label: "Тарифы" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contact", label: "Связаться" }
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
    <header className="border-b border-white/10 bg-[#0f1932]/94 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5 sm:px-10">
        <nav className="hidden items-center gap-6 text-sm text-[#f7ecd9]/78 md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="flex items-center gap-3 text-[#fff3dd]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#cda45a]/45 bg-white/5 text-sm font-semibold">
            MS
          </span>
          <span className="font-display text-lg tracking-[0.24em]">MagicStory</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <details className="group relative">
              <summary className="flex list-none cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 transition hover:border-[#cda45a]/45 [&::-webkit-details-marker]:hidden">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#23324f] text-xs font-semibold text-[#fff3dd]">
                  {initials}
                </span>
                <span className="hidden max-w-[12rem] truncate font-medium text-white sm:block">
                  {displayName}
                </span>
                <span className="text-white/45 transition group-open:rotate-180">
                  ▾
                </span>
              </summary>

              <div className="absolute right-0 mt-3 w-[19rem] rounded-lg border border-white/10 bg-[#13203c] p-4 shadow-2xl">
                <div className="rounded-lg border border-white/10 bg-[#182540] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#f0ddae]">
                    Почта
                  </p>
                  <p className="mt-2 break-all text-sm text-white">{user.email}</p>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-[#182540] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#f0ddae]">
                      Сказки
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">Только текст</p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-[#182540] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#f0ddae]">
                      Тариф
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatPlanLabel(profile?.subscription_status)}
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:border-[#cda45a]/45 hover:bg-white/5"
                >
                  Открыть кабинет
                </Link>

                <SignOutButton className="mt-3 w-full justify-center rounded-lg border border-white/10 bg-[#182540] px-4 py-3 text-sm text-white transition hover:border-[#cda45a]/45 hover:bg-white/5" />
              </div>
            </details>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/85 transition hover:border-[#cda45a]/45 hover:text-white"
              >
                Войти
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-lg bg-[#cda45a] px-4 py-2 text-sm font-medium text-[#0f1932] transition hover:bg-[#d8b673]"
              >
                Начать
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
