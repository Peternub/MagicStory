import Link from "next/link";
import { createStory } from "@/app/actions/stories";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SeriesEpisodeForm } from "@/components/stories/series-episode-form";
import { getUserSummary } from "@/lib/account/user-summary";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserDisplayName } from "@/lib/user/display-name";

export const dynamic = "force-dynamic";

type ChildPreview = {
  id: string;
  name: string;
  age: number;
};

type SeriesPreview = {
  id: string;
  child_id: string;
  title: string;
  children?: unknown;
  stories?: unknown;
};

type SubscriptionPreview = {
  status: string;
  current_period_end: string | null;
  subscription_plans?: unknown;
};

function getRelationName(relation: unknown) {
  const value = Array.isArray(relation) ? relation[0] : relation;

  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === "string" ? name : null;
  }

  return null;
}

function getRelationCount(relation: unknown) {
  if (!Array.isArray(relation)) {
    return 0;
  }

  const count = relation[0]?.count;
  return typeof count === "number" ? count : 0;
}

function formatChildAge(age: number) {
  const lastTwoDigits = age % 100;
  const lastDigit = age % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${age} лет`;
  }

  if (lastDigit === 1) {
    return `${age} год`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${age} года`;
  }

  return `${age} лет`;
}

function formatStoryCount(count: number) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "серий";
  }

  if (lastDigit === 1) {
    return "серия";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "серии";
  }

  return "серий";
}

function getSubscriptionDisplay(subscription: SubscriptionPreview | null) {
  if (!subscription?.current_period_end) {
    return {
      detail: "Выбрать тариф",
      plan: "Пробный доступ"
    };
  }

  const renewalDate = new Date(subscription.current_period_end);

  return {
    detail: `До ${new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long"
    }).format(renewalDate)}`,
    plan: getRelationName(subscription.subscription_plans) ?? "Активный тариф"
  };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const displayName = getUserDisplayName(user);
  const greetingName = displayName.split(/\s+/)[0] || displayName;
  const supabase = await createSupabaseServerClient();

  const [
    summary,
    { data: children, count: childrenCount },
    { data: recentSeriesData },
    { data: subscriptionData }
  ] = await Promise.all([
    getUserSummary(user.id),
    supabase
      .from("children")
      .select("id, name, age", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("story_series")
      .select("id, child_id, title, children(name), stories(count)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("subscriptions")
      .select("status, current_period_end, subscription_plans(name)")
      .eq("user_id", user.id)
      .in("status", ["pending", "active", "past_due", "canceled"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const child = (children?.[0] ?? null) as ChildPreview | null;
  const recentSeries = (recentSeriesData ?? []) as SeriesPreview[];
  const latestSeries = recentSeries[0] ?? null;
  const subscription = (subscriptionData ?? null) as SubscriptionPreview | null;
  const subscriptionDisplay = getSubscriptionDisplay(subscription);
  const episodeCount = getRelationCount(latestSeries?.stories);
  const seriesChildName = getRelationName(latestSeries?.children);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-4 border-b border-[var(--border-soft)] pb-5 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--logo-text)]">
            Личный кабинет
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text-main)] sm:text-4xl">
            Добрый вечер, {greetingName}
          </h1>
        </div>
        <SignOutButton className="self-start px-1 py-2 text-sm text-[var(--text-soft)] transition hover:text-[var(--text-main)] sm:self-auto lg:hidden" />
      </header>

      <section className="mt-6 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-card-alt)] p-5 sm:p-7">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">
          Вечерняя серия
        </p>
        <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-[var(--text-main)] sm:text-3xl">
              {latestSeries?.title ?? "Создайте первый сериал"}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              {latestSeries
                ? `${seriesChildName ?? "Персональный сериал"} · ${episodeCount} ${
                    episodeCount === 1 ? "серия" : "серий"
                  }`
                : "Новая история каждый вечер"}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href="/series"
              className="order-2 text-center text-sm font-medium text-[var(--text-soft)] transition hover:text-[var(--text-main)] sm:order-1"
            >
              Все сериалы
            </Link>
            {latestSeries ? (
              <div className="order-1 w-full sm:order-2 sm:w-72">
                <SeriesEpisodeForm
                  action={createStory}
                  childId={latestSeries.child_id}
                  seriesId={latestSeries.id}
                  hasEpisodes={episodeCount > 0}
                />
              </div>
            ) : (
              <Link
                href="/series/new"
                className="order-1 inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg bg-[var(--button-dark)] px-5 py-3 text-sm font-semibold text-[var(--button-dark-text)] transition hover:opacity-90 sm:order-2 sm:w-auto"
              >
                Создать сериал
              </Link>
            )}
          </div>
        </div>
      </section>

      {recentSeries.length > 0 ? (
        <section className="mt-4 overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)]">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border-soft)] px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-[var(--text-main)]">Последние сериалы</h2>
            <Link
              href="/series"
              className="text-sm font-medium text-[var(--logo-text)] transition hover:text-[var(--text-main)]"
            >
              Все
            </Link>
          </div>
          <div className="divide-y divide-[var(--border-soft)]">
            {recentSeries.map((series) => {
              const count = getRelationCount(series.stories);
              const childName = getRelationName(series.children) ?? "Персональный сериал";

              return (
                <div
                  key={series.id}
                  className="flex min-h-16 items-center justify-between gap-3 px-5 py-3 sm:px-6"
                >
                  <Link href={`/series/${series.id}`} className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[var(--text-main)] transition hover:text-[var(--logo-text)]">
                      {series.title}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--text-soft)]">
                      {childName} · {count} {formatStoryCount(count)}
                    </span>
                  </Link>
                  <SeriesEpisodeForm
                    action={createStory}
                    childId={series.child_id}
                    seriesId={series.id}
                    hasEpisodes={count > 0}
                    compact
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section
        aria-label="Краткая информация"
        className="mt-4 overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] sm:grid sm:grid-cols-3"
      >
        <Link
          href={child ? "/children" : "/children/new"}
          className="block p-5 transition hover:bg-[var(--surface-soft)] sm:p-6"
        >
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--logo-text)]">Ребёнок</p>
          <p className="mt-2 truncate text-xl font-semibold text-[var(--text-main)]">
            {child?.name ?? "Добавить профиль"}
          </p>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            {child
              ? `${formatChildAge(child.age)}${
                  (childrenCount ?? 0) > 1 ? ` · ещё ${(childrenCount ?? 1) - 1}` : ""
                }`
              : "Для персональных серий"}
          </p>
        </Link>

        <Link
          href="/stories"
          className="block border-t border-[var(--border-soft)] p-5 transition hover:bg-[var(--surface-soft)] sm:border-l sm:border-t-0 sm:p-6"
        >
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--logo-text)]">Библиотека</p>
          <p className="mt-2 text-xl font-semibold text-[var(--text-main)]">
            {summary.storiesCount} {formatStoryCount(summary.storiesCount)}
          </p>
          <p className="mt-1 text-sm text-[var(--text-soft)]">Открыть истории</p>
        </Link>

        <Link
          href="/billing"
          className="block border-t border-[var(--border-soft)] p-5 transition hover:bg-[var(--surface-soft)] sm:border-l sm:border-t-0 sm:p-6"
        >
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--logo-text)]">Тариф</p>
          <p className="mt-2 truncate text-xl font-semibold text-[var(--text-main)]">
            {subscriptionDisplay.plan}
          </p>
          <p className="mt-1 text-sm text-[var(--text-soft)]">{subscriptionDisplay.detail}</p>
        </Link>
      </section>
    </main>
  );
}
