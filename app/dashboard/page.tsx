import Link from "next/link";
import { OnboardingCard } from "@/components/dashboard/onboarding-card";
import { requireUser } from "@/lib/supabase/auth";
import { getOnboardingState } from "@/lib/supabase/onboarding";
import { getUserDisplayName } from "@/lib/user/display-name";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const onboarding = await getOnboardingState(user.id);
  const displayName = getUserDisplayName(user);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <section className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(26,13,43,0.88),rgba(49,21,93,0.78))] p-8 shadow-glow sm:p-10">
        <p className="text-sm uppercase tracking-[0.22em] text-brand-200">
          Кабинет
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold text-white sm:text-6xl">
          Здравствуйте, <span className="text-brand-100">{displayName}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
          Здесь все нужное под рукой: создание новых сказок, профили детей и быстрый
          переход в библиотеку.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <article className="rounded-[2rem] border border-white/10 bg-[#160a27] p-6 text-white shadow-[0_20px_50px_rgba(9,5,16,0.3)]">
            <p className="text-sm uppercase tracking-[0.2em] text-brand-200">
              Сказки
            </p>
            <p className="mt-3 text-4xl font-semibold text-white">Без лимита</p>
            <p className="mt-2 text-sm text-white/72">
              можно создавать без ограничений
            </p>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-[#160a27] p-6 text-white shadow-[0_20px_50px_rgba(9,5,16,0.3)]">
            <p className="text-sm uppercase tracking-[0.2em] text-brand-200">
              Дети
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Профили детей</h2>
            <p className="mt-3 text-base leading-7 text-white/72">
              Добавляйте и редактируйте профили, чтобы сказки были действительно персональными.
            </p>
            <Link
              href="/children"
              className="mt-6 inline-flex rounded-full bg-brand-300 px-5 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-200"
            >
              Открыть раздел
            </Link>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-[#160a27] p-6 text-white shadow-[0_20px_50px_rgba(9,5,16,0.3)]">
            <p className="text-sm uppercase tracking-[0.2em] text-brand-200">
              Сказки
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Новая история</h2>
            <p className="mt-3 text-base leading-7 text-white/72">
              Запустите генерацию новой сказки или откройте библиотеку уже созданных историй.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/stories/new"
                className="inline-flex rounded-full bg-brand-300 px-5 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-200"
              >
                Создать сказку
              </Link>
              <Link
                href="/stories"
                className="inline-flex rounded-full border border-brand-300 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Библиотека
              </Link>
            </div>
          </article>
        </div>
      </section>

      <OnboardingCard
        hasChildren={onboarding.hasChildren}
        hasStories={onboarding.hasStories}
      />
    </main>
  );
}
