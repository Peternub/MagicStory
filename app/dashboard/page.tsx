import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-brand-700">
            Личный кабинет
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-brand-900">
            Здравствуйте, {user.email}
          </h1>
        </div>
        <SignOutButton />
      </header>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <article className="rounded-[2rem] border border-brand-200/70 bg-white/85 p-8">
          <h2 className="text-xl font-semibold text-brand-900">
            Профили детей
          </h2>
          <p className="mt-3 text-sm leading-6 text-brand-900/70">
            Следующим шагом здесь появится управление профилями детей и их
            параметрами для генерации сказок.
          </p>
        </article>

        <article className="rounded-[2rem] bg-brand-900 p-8 text-brand-50">
          <h2 className="text-xl font-semibold">Создание сказки</h2>
          <p className="mt-3 text-sm leading-6 text-brand-100/80">
            После добавления профиля ребенка пользователь сможет выбрать тему
            дня и запустить генерацию новой истории.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-brand-300 px-5 py-3 text-sm font-medium text-brand-950"
          >
            Вернуться на главную
          </Link>
        </article>
      </section>
    </main>
  );
}
