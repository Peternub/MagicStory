import Link from "next/link";
import { PlanCard } from "@/components/billing/plan-card";
import type { SubscriptionPlan, SubscriptionRecord } from "@/lib/types/billing";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const [{ data: plans }, { data: subscriptions }, { data: profile }] =
    await Promise.all([
      supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_rub", { ascending: true }),
      supabase
        .from("subscriptions")
        .select("*, subscription_plans(code)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("profiles")
        .select("stories_balance, subscription_status")
        .eq("id", user.id)
        .single()
    ]);

  const currentSubscription = (subscriptions?.[0] ?? null) as
    | (SubscriptionRecord & {
        subscription_plans?: {
          code?: string;
        };
      })
    | null;

  const currentPlanCode = currentSubscription?.subscription_plans?.code ?? null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-brand-700">
            Тарифы и лимиты
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-brand-900">
            Управление подпиской
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex rounded-full border border-brand-300 px-5 py-3 text-sm font-medium text-brand-900"
        >
          Вернуться в кабинет
        </Link>
      </header>

      <section className="mt-8 rounded-[2rem] bg-brand-900 p-8 text-brand-50">
        <p className="text-sm text-brand-200">
          Текущий баланс сказок: {profile?.stories_balance ?? 0}
        </p>
        <p className="mt-2 text-sm text-brand-100/80">
          Статус подписки: {profile?.subscription_status ?? "free"}
        </p>
        <p className="mt-4 text-sm text-brand-100/80">
          На этом шаге мы уже сохраняем заявки на подписку в базе. Следующим
          этапом подключим оплату через YooKassa.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {((plans ?? []) as SubscriptionPlan[]).map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlanCode={currentPlanCode}
          />
        ))}
      </section>
    </main>
  );
}
