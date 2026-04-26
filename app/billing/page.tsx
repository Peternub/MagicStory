import Link from "next/link";
import { PricingTabs } from "@/components/site/pricing-tabs";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[96rem] flex-col px-6 py-10 sm:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[var(--logo-text)]">
            Тарифы
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text-main)]">
            Пакеты сказок и аудио-сказок
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] px-5 py-3 text-sm font-medium text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
        >
          Вернуться в кабинет
        </Link>
      </header>

      <section
        className="mt-8 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-8 text-[var(--text-main)]"
        style={{ boxShadow: "var(--glow-shadow)" }}
      >
        <p className="text-sm text-[var(--logo-text)]">
          Сказки, аудио-сказки и два уровня модели
        </p>
        <p className="mt-2 text-sm text-[var(--text-soft)]">
          Статус подписки: {profile?.subscription_status ?? "free"}
        </p>
        <p className="mt-4 text-sm text-[var(--text-soft)]">
          Оплату через YooKassa подключим следующим шагом. Сетка тарифов уже готова.
        </p>
      </section>

      <section className="mt-10">
        <PricingTabs variant="billing" />
      </section>
    </main>
  );
}
