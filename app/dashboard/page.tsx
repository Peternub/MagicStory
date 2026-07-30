import Link from "next/link";
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

function formatDays(value: number) {
  const lastTwoDigits = value % 100;
  const lastDigit = value % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${value} дней`;
  }

  if (lastDigit === 1) {
    return `${value} день`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${value} дня`;
  }

  return `${value} дней`;
}

function getSubscriptionDisplay(subscription: SubscriptionPreview | null) {
  if (!subscription?.current_period_end) {
    return {
      value: "Не оформлена",
      detail: "Выберите подходящий тариф",
      plan: "Пробный доступ"
    };
  }

  const renewalDate = new Date(subscription.current_period_end);
  const daysLeft = Math.max(
    0,
    Math.ceil((renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return {
    value: daysLeft === 0 ? "Сегодня" : formatDays(daysLeft),
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
  const supabase = await createSupabaseServerClient();

  const [
    summary,
    { data: children, count: childrenCount },
    { data: latestSeriesData },
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
      .select("id, title, children(name), stories(count)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
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
  const latestSeries = (latestSeriesData ?? null) as SeriesPreview | null;
  const subscription = (subscriptionData ?? null) as SubscriptionPreview | null;
  const subscriptionDisplay = getSubscriptionDisplay(subscription);
  const episodeCount = getRelationCount(latestSeries?.stories);
  const seriesChildName = getRelationName(latestSeries?.children);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
      <header className="border-b border-[var(--border-soft)] pb-6 sm:pb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--logo-text)]">
          Личный кабинет
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--text-main)] sm:text-4xl">
          Добрый вечер, {displayName}
        </h1>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">
            Ребёнок
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-semibold text-[var(--text-main)]">
                {child?.name ?? "Профиль не создан"}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                {child
                  ? `${formatChildAge(child.age)}${
                      (childrenCount ?? 0) > 1 ? ` · ещё ${(childrenCount ?? 1) - 1}` : ""
                    }`
                  : "Добавьте данные для персональных историй"}
              </p>
            </div>
            <Link
              href={child ? "/children" : "/children/new"}
              className="shrink-0 text-sm font-semibold text-[var(--logo-text)] transition hover:text-[var(--text-main)]"
            >
              {child ? "Изменить" : "Добавить"}
            </Link>
          </div>
        </article>

        <article className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">
                До продления
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--text-main)]">
                {subscriptionDisplay.value}
              </p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                {subscriptionDisplay.plan} · {subscriptionDisplay.detail}
              </p>
            </div>
            <Link
              href="/billing"
              className="shrink-0 text-sm font-semibold text-[var(--logo-text)] transition hover:text-[var(--text-main)]"
            >
              Тарифы
            </Link>
          </div>
        </article>
      </section>

      <section className="mt-4 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-card-alt)] p-5 sm:p-7">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">
          Сегодня вечером
        </p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-[var(--text-main)] sm:text-3xl">
              {latestSeries?.title ?? "Создайте первый сериал"}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              {latestSeries
                ? `${seriesChildName ?? "Персональный сериал"} · ${episodeCount} ${
                    episodeCount === 1 ? "серия" : "серий"
                  }`
                : "Один сериал — новые продолжения каждый вечер"}
            </p>
          </div>
          <Link
            href={latestSeries ? `/series/${latestSeries.id}` : "/series/new"}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--button-dark)] px-5 py-3 text-sm font-semibold text-[var(--button-dark-text)] transition hover:opacity-90 sm:w-auto"
          >
            {latestSeries ? "Создать новую серию" : "Создать сериал"}
          </Link>
        </div>
      </section>

      <section className="mt-4 flex flex-col gap-4 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">
            Библиотека
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-main)]">
            {summary.storiesCount} {summary.storiesCount === 1 ? "история" : "историй"}
          </p>
        </div>
        <Link
          href="/stories"
          className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--border-strong)] px-5 py-3 text-sm font-semibold text-[var(--text-main)] transition hover:bg-[var(--surface-soft)] sm:w-auto"
        >
          Открыть библиотеку
        </Link>
      </section>
    </main>
  );
}
