import Link from "next/link";
import { PlanCard } from "@/components/billing/plan-card";
import { magicPlans } from "@/lib/config/pricing";
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
          <p className="text-sm uppercase tracking-[0.25em] text-brand-200">
            Тарифы
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Линейка M A G I C
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"
        >
          Вернуться в кабинет
        </Link>
      </header>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#160a27] p-8 text-white">
        <p className="text-sm text-brand-200">Пять тарифов в логике M A G I C</p>
        <p className="mt-2 text-sm text-white/80">
          Статус подписки: {profile?.subscription_status ?? "free"}
        </p>
        <p className="mt-4 text-sm text-white/70">
          Оплату через YooKassa подключим следующим шагом. Пока фиксируем тарифную сетку и интерфейс.
        </p>
      </section>

      <section className="mt-10 grid gap-5 xl:grid-cols-5">
        {magicPlans.map((plan) => (
          <PlanCard key={plan.code} plan={plan} />
        ))}
      </section>
    </main>
  );
}
