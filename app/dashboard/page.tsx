import Link from "next/link";
import { OnboardingCard } from "@/components/dashboard/onboarding-card";
import { requireUser } from "@/lib/supabase/auth";
import { getOnboardingState } from "@/lib/supabase/onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserDisplayName } from "@/lib/user/display-name";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stories_balance")
    .eq("id", user.id)
    .single();
  const onboarding = await getOnboardingState(user.id);
  const displayName = getUserDisplayName(user);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <header>
        <p className="text-sm uppercase tracking-[0.22em] text-brand-300">
          Кабинет
        </p>
        <h1 className="mt-3 max-w-4xl break-words text-3xl font-semibold text-white sm:text-5xl">
          Здравствуйте, <span className="text-brand-100">{displayName}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
          Здесь всего два основных действия: добавить ребенка и создать первую сказку.
        </p>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <article className="rounded-[2rem] border border-white/10 bg-white/85 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-700">
            Баланс
          </p>
          <p className="mt-3 text-4xl font-semibold text-brand-950">
            {profile?.stories_balance ?? 0}
          </p>
          <p className="mt-2 text-sm text-brand-900/70">сказок доступно сейчас</p>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-brand-900 p-6 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-200">
            Дети
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Профили детей</h2>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Управляйте профилями и данными для персонализации историй.
          </p>
          <Link
            href="/children"
            className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-950"
          >
            Открыть раздел
          </Link>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-brand-900 p-6 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-brand-200">
            Сказки
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Новая история</h2>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Запустите генерацию по теме дня или откройте библиотеку готовых сказок.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/stories/new"
              className="inline-flex rounded-full bg-brand-300 px-4 py-2 text-sm font-semibold text-brand-950"
            >
              Создать
            </Link>
            <Link
              href="/stories"
              className="inline-flex rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-white"
            >
              Библиотека
            </Link>
          </div>
        </article>
      </section>

      <OnboardingCard
        hasChildren={onboarding.hasChildren}
        hasStories={onboarding.hasStories}
      />
    </main>
  );
}
