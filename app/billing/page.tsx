import Link from "next/link";
import { HouseSection } from "@/components/dashboard/house-section";
import { PricingTabs } from "@/components/site/pricing-tabs";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SubscriptionPlanPreview = {
  code: string;
  description: string | null;
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
  pending: "Ожидает подключения"
};

function getPlan(relation: unknown): SubscriptionPlanPreview | null {
  const value = Array.isArray(relation) ? relation[0] : relation;

  if (!value || typeof value !== "object" || !("name" in value)) {
    return null;
  }

  return value as SubscriptionPlanPreview;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Не указана";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

export default async function BillingPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data: subscriptionData } = await supabase
    .from("subscriptions")
    .select(
      "status, started_at, current_period_end, external_subscription_id, subscription_plans(code, name, description, price_rub, stories_limit)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const subscription = (subscriptionData ?? null) as SubscriptionPreview | null;
  const plan = getPlan(subscription?.subscription_plans);
  const { count: storiesUsed } = subscription?.started_at
    ? await supabase
        .from("stories")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", subscription.started_at)
    : { count: 0 };
  const usedCount = storiesUsed ?? 0;
  const storiesLimit = plan?.stories_limit ?? 0;
  const usagePercent = storiesLimit > 0 ? Math.min((usedCount / storiesLimit) * 100, 100) : 0;

  return (
    <HouseSection
      room="study"
      eyebrow="Домашний кабинет"
      title="Тариф и управление тарифом"
      actions={
        <Link
          href="#plans"
          className="house-primary-button"
        >
          Посмотреть тарифы
        </Link>
      }
    >
      <section className="billing-vault" aria-labelledby="current-plan-title">
        <div className="billing-vault__safe" aria-hidden="true">
          <div className="billing-vault__door"><span /></div>
          <div className="billing-vault__inside">
            <span>MS</span>
            <span />
            <span />
          </div>
        </div>

        <article className="house-panel billing-current-plan">
          {subscription && plan ? (
            <>
              <div className="billing-current-plan__topline">
                <div>
                  <p>Текущий тариф</p>
                  <h2 id="current-plan-title">{plan.name}</h2>
                </div>
                <span className={`billing-status billing-status--${subscription.status}`}>
                  {statusLabels[subscription.status] ?? subscription.status}
                </span>
              </div>

              <div className="billing-current-plan__price">
                <strong>{plan.price_rub.toLocaleString("ru-RU")} ₽</strong>
                <span>в месяц</span>
              </div>
              {plan.description ? <p>{plan.description}</p> : null}

              <dl className="billing-facts">
                <div>
                  <dt>Период начался</dt>
                  <dd>{formatDate(subscription.started_at)}</dd>
                </div>
                <div>
                  <dt>Следующая дата</dt>
                  <dd>{formatDate(subscription.current_period_end)}</dd>
                </div>
                <div>
                  <dt>Оплата</dt>
                  <dd>{subscription.external_subscription_id ? "YooKassa подключена" : "Не подключена"}</dd>
                </div>
              </dl>

              <div className="billing-usage">
                <div>
                  <span>Использование серий</span>
                  <strong>
                    {storiesLimit > 0 ? `${usedCount} из ${storiesLimit}` : `${usedCount} · без лимита`}
                  </strong>
                </div>
                <div className="billing-usage__track">
                  <span style={{ width: storiesLimit > 0 ? `${usagePercent}%` : "100%" }} />
                </div>
              </div>

              <div className="billing-current-plan__actions">
                <Link href="#plans" className="house-primary-button">Изменить тариф</Link>
                <button type="button" className="house-secondary-button" disabled>
                  Управление оплатой скоро
                </button>
              </div>
              <p className="billing-cancel-note">
                Отмена — после подключения оплаты.
              </p>
            </>
          ) : (
            <div className="billing-no-plan">
              <p>Сейф открыт</p>
              <h2 id="current-plan-title">Тариф пока не выбран</h2>
              <Link href="#plans" className="house-primary-button">Посмотреть варианты</Link>
            </div>
          )}
        </article>
      </section>

      <section id="plans" className="house-panel billing-plans">
        <div className="billing-plans__heading">
          <p>Варианты</p>
          <h2>Доступные тарифы</h2>
        </div>
        <PricingTabs variant="billing" />
      </section>
    </HouseSection>
  );
}
