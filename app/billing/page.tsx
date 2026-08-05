import Link from "next/link";
import { AccountPageShell } from "@/components/dashboard/house-section";
import { PricingTabs } from "@/components/site/pricing-tabs";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SubscriptionPlanPreview = {
  name: string;
  price_rub: number;
  stories_limit: number;
};

type SubscriptionPreview = {
  current_period_end: string | null;
  external_subscription_id: string | null;
  started_at: string | null;
  status: string;
  subscription_plans?: unknown;
};

const statusLabels: Record<string, string> = {
  active: "Активен",
  canceled: "Отменён",
  expired: "Завершён",
  past_due: "Требуется оплата",
  pending: "Ожидает оплаты"
};

function getPlan(relation: unknown): SubscriptionPlanPreview | null {
  const value = Array.isArray(relation) ? relation[0] : relation;

  if (!value || typeof value !== "object" || !("name" in value)) {
    return null;
  }

  return value as SubscriptionPlanPreview;
}

function formatDate(value: string | null) {
  if (!value) return "Не указана";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

export default async function BillingPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "status, started_at, current_period_end, external_subscription_id, subscription_plans(name, price_rub, stories_limit)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const subscription = (data ?? null) as SubscriptionPreview | null;
  const plan = getPlan(subscription?.subscription_plans);
  const { count } = subscription?.started_at
    ? await supabase
        .from("stories")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", subscription.started_at)
    : { count: 0 };

  const storiesUsed = count ?? 0;

  return (
    <AccountPageShell title="Тариф">
      {subscription && plan ? (
        <section className="current-subscription">
          <div className="current-subscription__header">
            <div>
              <span>Текущий тариф</span>
              <h2>{plan.name}</h2>
            </div>
            <span className={`subscription-status subscription-status--${subscription.status}`}>
              {statusLabels[subscription.status] ?? subscription.status}
            </span>
          </div>

          <div className="current-subscription__price">
            <strong>{plan.price_rub.toLocaleString("ru-RU")} ₽</strong>
            <span>в месяц</span>
          </div>

          <dl className="subscription-facts">
            <div>
              <dt>Следующая дата</dt>
              <dd>{formatDate(subscription.current_period_end)}</dd>
            </div>
            <div>
              <dt>Лимит</dt>
              <dd>
                {plan.stories_limit > 0
                  ? `${storiesUsed} из ${plan.stories_limit} серий`
                  : "Без лимита"}
              </dd>
            </div>
            <div>
              <dt>Оплата</dt>
              <dd>{subscription.external_subscription_id ? "YooKassa" : "Не подключена"}</dd>
            </div>
          </dl>

          <div className="current-subscription__actions">
            <Link href="#plans" className="account-primary-button">
              Изменить тариф
            </Link>
            <button type="button" className="account-secondary-button" disabled>
              Управление оплатой
            </button>
          </div>
        </section>
      ) : (
        <div className="account-empty-state">
          <p>Тариф не выбран</p>
          <Link href="#plans">Выбрать тариф</Link>
        </div>
      )}

      <section id="plans" className="plan-comparison">
        <h2>Другие тарифы</h2>
        <PricingTabs variant="billing" />
      </section>
    </AccountPageShell>
  );
}
