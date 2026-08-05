import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserDisplayName, getUserInitials } from "@/lib/user/display-name";

type ChildPreview = {
  id: string;
  name: string;
  age: number;
};

type StoryPreview = {
  id: string;
  child_id: string | null;
  title: string | null;
  theme: string;
  status: string;
  created_at: string;
};

type SeriesPreview = {
  id: string;
  title: string;
  premise: string;
  stories?: unknown;
};

type SubscriptionPreview = {
  status: string;
  current_period_end: string | null;
  subscription_plans?: unknown;
};

type ProfilePreview = {
  subscription_status: string;
  stories_balance: number;
  created_at: string;
};

const storyStatus: Record<string, { label: string; className: string }> = {
  pending: {
    label: "В очереди",
    className: "bg-[var(--accent-gold-soft)] text-[var(--text-strong)]"
  },
  text_generating: {
    label: "Создаётся",
    className: "bg-amber-400/10 text-amber-200"
  },
  completed: {
    label: "Готова",
    className: "bg-emerald-400/10 text-emerald-200"
  },
  failed: {
    label: "Ошибка",
    className: "bg-red-400/10 text-red-200"
  }
};

const subscriptionStatus: Record<string, string> = {
  pending: "Ожидает оплаты",
  active: "Активен",
  past_due: "Нужна оплата",
  canceled: "Отменён",
  expired: "Завершён"
};

function getRelationValue(relation: unknown, key: string) {
  const value = Array.isArray(relation) ? relation[0] : relation;

  if (value && typeof value === "object" && key in value) {
    return (value as Record<string, unknown>)[key];
  }

  return null;
}

function getRelationCount(relation: unknown) {
  const count = getRelationValue(relation, "count");
  return typeof count === "number" ? count : 0;
}

function formatAge(age: number) {
  const lastTwoDigits = age % 100;
  const lastDigit = age % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${age} лет`;
  if (lastDigit === 1) return `${age} год`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${age} года`;
  return `${age} лет`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short"
  }).format(new Date(value));
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

export async function ParentDashboard() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const displayName = getUserDisplayName(user);
  const greetingName = displayName.split(/\s+/)[0] || displayName;

  const [
    { data: profileData },
    { data: childrenData },
    { data: seriesData },
    { data: storiesData },
    { data: subscriptionData }
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("subscription_status, stories_balance, created_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("children")
      .select("id, name, age")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("story_series")
      .select("id, title, premise, stories(count)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("stories")
      .select("id, child_id, title, theme, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("status, current_period_end, subscription_plans(name)")
      .eq("user_id", user.id)
      .in("status", ["pending", "active", "past_due", "canceled"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const profile = (profileData ?? null) as ProfilePreview | null;
  const children = (childrenData ?? []) as ChildPreview[];
  const seriesItems = (seriesData ?? []) as SeriesPreview[];
  const stories = (storiesData ?? []) as StoryPreview[];
  const subscription = (subscriptionData ?? null) as SubscriptionPreview | null;
  const latestSeries = seriesItems[0] ?? null;
  const latestStory = stories[0] ?? null;
  const activeStoriesCount = stories.filter((story) =>
    ["pending", "text_generating"].includes(story.status)
  ).length;
  const completedStoriesCount = stories.filter((story) => story.status === "completed").length;
  const planName = getRelationValue(subscription?.subscription_plans, "name");
  const planLabel =
    typeof planName === "string"
      ? planName
      : profile?.subscription_status === "free"
        ? "Пробный"
        : "Активный тариф";
  const primaryHref = latestSeries
    ? `/series/${latestSeries.id}`
    : children.length
      ? "/series/new"
      : "/children/new";
  const primaryLabel = latestSeries
    ? "Продолжить сериал"
    : children.length
      ? "Создать сериал"
      : "Добавить ребёнка";

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-5 border-b border-[var(--border-soft)] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--accent-gold-soft)] text-sm font-semibold text-[var(--text-strong)]">
            {getUserInitials(user)}
          </span>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--logo-text)]">Личный кабинет</p>
            <h1 className="mt-1 truncate text-2xl font-semibold text-[var(--text-main)] sm:text-3xl">
              Добрый вечер, {greetingName}
            </h1>
          </div>
        </div>

        <Link
          href={primaryHref}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--button-dark)] px-5 py-3 text-sm font-semibold text-[var(--button-dark-text)] hover:opacity-90 sm:w-auto"
        >
          {primaryLabel}
        </Link>
      </header>

      <nav aria-label="Разделы личного кабинета" className="mt-4 flex gap-2 overflow-x-auto pb-1 text-sm text-[var(--text-soft)]">
        <Link href="/children" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-[var(--surface-soft)] hover:text-[var(--text-main)]">Дети</Link>
        <Link href="/series" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-[var(--surface-soft)] hover:text-[var(--text-main)]">Сериалы</Link>
        <Link href="/stories" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-[var(--surface-soft)] hover:text-[var(--text-main)]">Библиотека</Link>
        <Link href="/billing" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-[var(--surface-soft)] hover:text-[var(--text-main)]">Тариф</Link>
      </nav>

      <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.8fr)]">
        <article className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-card-alt)] p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">На сегодня</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--text-main)] sm:text-3xl">
                {latestSeries?.title ?? "Начните первую семейную историю"}
              </h2>
              <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-[var(--text-soft)]">
                {latestSeries?.premise ?? "Добавьте профиль ребёнка — его интересы и близкие станут частью нового сериала."}
              </p>
            </div>
            {latestSeries ? (
              <span className="shrink-0 rounded-full bg-[var(--accent-gold-soft)] px-3 py-1 text-xs text-[var(--text-strong)]">
                {getRelationCount(latestSeries.stories)} серий
              </span>
            ) : null}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href={primaryHref} className="text-sm font-semibold text-[var(--text-strong)] hover:text-[var(--text-main)]">
              {primaryLabel} →
            </Link>
            {latestStory ? (
              <Link href={`/stories/${latestStory.id}`} className="text-sm text-[var(--text-soft)] hover:text-[var(--text-main)]">
                Последняя серия
              </Link>
            ) : null}
          </div>
        </article>

        <article className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">Тариф</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--text-main)]">{planLabel}</h2>
            </div>
            <span className="rounded-full bg-[var(--accent-lavender-soft)] px-3 py-1 text-xs text-[var(--text-main)]">
              {subscription ? subscriptionStatus[subscription.status] ?? subscription.status : "Доступен"}
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-y border-[var(--border-soft)] py-4">
            <div>
              <p className="text-2xl font-semibold text-[var(--text-main)]">{profile?.stories_balance ?? 0}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">серий осталось</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-main)]">
                {subscription?.current_period_end ? formatShortDate(subscription.current_period_end) : "Без даты"}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">действует до</p>
            </div>
          </div>
          <Link href="/billing" className="mt-4 inline-flex text-sm text-[var(--text-strong)] hover:text-[var(--text-main)]">
            Управление тарифом →
          </Link>
        </article>
      </section>

      <section aria-label="Статистика" className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-card)] sm:grid-cols-4">
        {[
          { label: "Детей", value: children.length, href: "/children" },
          { label: "Сериалов", value: seriesItems.length, href: "/series" },
          { label: "Готовых серий", value: completedStoriesCount, href: "/stories" },
          { label: "Создаётся", value: activeStoriesCount, href: "/stories" }
        ].map((item, index) => (
          <Link
            key={item.label}
            href={item.href}
            className={`p-4 hover:bg-[var(--surface-soft)] sm:p-5 ${index % 2 ? "border-l border-[var(--border-soft)]" : ""} ${index > 1 ? "border-t border-[var(--border-soft)] sm:border-t-0" : ""} ${index === 2 ? "sm:border-l" : ""}`}
          >
            <p className="text-2xl font-semibold text-[var(--text-main)]">{item.value}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{item.label}</p>
          </Link>
        ))}
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <section className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">Семья</p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--text-main)]">Профили детей</h2>
            </div>
            <Link href="/children/new" aria-label="Добавить ребёнка" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] text-xl text-[var(--text-strong)] hover:bg-[var(--surface-soft)]">+</Link>
          </div>

          {children.length ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {children.map((child) => {
                const childStoriesCount = stories.filter((story) => story.child_id === child.id).length;
                return (
                  <Link key={child.id} href={`/children/${child.id}`} className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] p-4 hover:border-[var(--border-strong)]">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-lavender-soft)] font-semibold text-[var(--text-main)]">
                        {child.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--text-main)]">{child.name}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{formatAge(child.age)} · {childStoriesCount} серий</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Link href="/children/new" className="mt-5 block rounded-lg border border-dashed border-[var(--border-strong)] p-5 text-sm text-[var(--text-soft)] hover:bg-[var(--surface-soft)]">
              Добавьте ребёнка, чтобы создавать персональные истории →
            </Link>
          )}
        </section>

        <section className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--logo-text)]">Библиотека</p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--text-main)]">Последние серии</h2>
            </div>
            <Link href="/stories" className="text-xs text-[var(--text-soft)] hover:text-[var(--text-main)]">Все</Link>
          </div>

          {stories.length ? (
            <div className="mt-5 divide-y divide-[var(--border-soft)]">
              {stories.slice(0, 4).map((story) => {
                const status = storyStatus[story.status] ?? storyStatus.pending;
                return (
                  <Link key={story.id} href={`/stories/${story.id}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--text-main)]">{story.title ?? story.theme}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{formatShortDate(story.created_at)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] ${status.className}`}>{status.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 text-sm text-[var(--text-soft)]">Здесь появятся готовые серии.</p>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-gold-soft)] text-xs font-semibold text-[var(--text-strong)]">
              {getUserInitials(user)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-[var(--text-main)]">{displayName}</h2>
              <p className="mt-1 truncate text-sm text-[var(--text-soft)]">{user.email ?? "Email не указан"}</p>
              {profile?.created_at ? <p className="mt-1 text-xs text-[var(--text-muted)]">С нами с {formatLongDate(profile.created_at)}</p> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/auth/forgot-password" className="text-[var(--text-soft)] hover:text-[var(--text-main)]">Сменить пароль</Link>
            <SignOutButton className="px-0 py-2 text-[var(--text-soft)] hover:text-[var(--text-main)]" />
          </div>
        </div>
      </section>
    </main>
  );
}
