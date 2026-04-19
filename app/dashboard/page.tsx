import Link from "next/link";
import { getUserSummary } from "@/lib/account/user-summary";
import { requireUser } from "@/lib/supabase/auth";
import { getUserDisplayName } from "@/lib/user/display-name";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const displayName = getUserDisplayName(user);
  const summary = await getUserSummary(user.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <section
        className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-8 sm:p-10"
        style={{ boxShadow: "var(--glow-shadow)" }}
      >
        <p className="text-sm uppercase tracking-[0.22em] text-[var(--logo-text)]">
          Кабинет родителя
        </p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold text-[var(--text-main)] sm:text-6xl">
          Здравствуйте, <span className="text-[var(--logo-text)]">{displayName}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-soft)]">
          Здесь под рукой все главное: остаток сказок, быстрый переход к созданию
          новой истории и ваша библиотека.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <article
            className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-6"
            style={{ boxShadow: "var(--glow-shadow)" }}
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--logo-text)]">
              Осталось сказок
            </p>
            <p className="mt-3 text-4xl font-semibold text-[var(--text-main)]">
              {summary.storiesBalance}
            </p>
            <p className="mt-2 text-sm text-[var(--text-soft)]">
              Можно создать прямо сейчас без дополнительных шагов.
            </p>
          </article>

          <article
            className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card-alt)] p-6"
            style={{ boxShadow: "var(--glow-shadow)" }}
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--logo-text)]">
              Создать сказку
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--text-main)]">
              Новый вечерний сюжет
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--text-soft)]">
              Заполните данные о ребенке, выберите настроение и сразу перейдите к
              новой сказке.
            </p>
            <Link
              href="/stories/new"
              className="mt-6 inline-flex rounded-lg bg-[var(--button-dark)] px-5 py-3 text-sm font-semibold text-[var(--button-dark-text)] transition hover:opacity-90"
            >
              Создать сказку
            </Link>
          </article>

          <article
            className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-6"
            style={{ boxShadow: "var(--glow-shadow)" }}
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--logo-text)]">
              Библиотека
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--text-main)]">
              Все ваши сказки
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--text-soft)]">
              Уже сохранено сказок: {summary.storiesCount}. Откройте библиотеку,
              чтобы читать и пересматривать готовые истории.
            </p>
            <Link
              href="/stories"
              className="mt-6 inline-flex rounded-lg border border-[var(--border-strong)] px-5 py-3 text-sm font-semibold text-[var(--text-main)] transition hover:bg-[var(--surface-soft)]"
            >
              Открыть библиотеку
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
