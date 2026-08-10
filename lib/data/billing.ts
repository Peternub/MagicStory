import "server-only";

import { STARTER_OFFER } from "@/lib/config/starter-offer";
import { queryDatabase } from "@/lib/db/client";
import { usesPostgresDataBackend } from "@/lib/data/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SubscriptionPlanPreview = {
  code: string;
  description: string | null;
  name: string;
  price_rub: number;
  stories_limit: number;
};

export type SubscriptionPreview = {
  current_period_end: string | null;
  external_subscription_id: string | null;
  started_at: string | null;
  status: string;
  subscription_plans?: unknown;
};

export async function getBillingOverview(userId: string) {
  if (usesPostgresDataBackend()) {
    const result = await queryDatabase<
      SubscriptionPreview & { stories_used: number }
    >(
      `
        select
          subscription.status,
          subscription.started_at,
          subscription.current_period_end,
          subscription.external_subscription_id,
          jsonb_build_object(
            'code', plan.code,
            'name', plan.name,
            'description', plan.description,
            'price_rub', plan.price_rub,
            'stories_limit', plan.stories_limit
          ) as subscription_plans,
          case
            when subscription.started_at is null then 0
            else (
              select count(*)::integer
              from public.stories story
              where story.user_id = $1
                and story.created_at >= subscription.started_at
            )
          end as stories_used
        from public.subscriptions subscription
        join public.subscription_plans plan on plan.id = subscription.plan_id
        where subscription.user_id = $1
        order by subscription.created_at desc
        limit 1
      `,
      [userId]
    );
    const row = result.rows[0];

    if (!row) {
      return { subscription: null, storiesUsed: 0 };
    }

    const { stories_used: storiesUsed, ...subscription } = row;
    return { subscription, storiesUsed };
  }

  const supabase = await createSupabaseServerClient();
  const { data: subscriptionData, error } = await supabase
    .from("subscriptions")
    .select(
      "status, started_at, current_period_end, external_subscription_id, subscription_plans(code, name, description, price_rub, stories_limit)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("BILLING_OVERVIEW_FAILED");
  }

  const subscription = (subscriptionData ?? null) as SubscriptionPreview | null;
  const { count, error: countError } = subscription?.started_at
    ? await supabase
        .from("stories")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", subscription.started_at)
    : { count: 0, error: null };

  if (countError) {
    throw new Error("BILLING_USAGE_FAILED");
  }

  return { subscription, storiesUsed: count ?? 0 };
}

export async function getStarterOfferRecord(userId: string) {
  if (usesPostgresDataBackend()) {
    const result = await queryDatabase<{ status: string; series_id: string | null }>(
      `
        select status, series_id
        from public.starter_offer_orders
        where user_id = $1
        limit 1
      `,
      [userId]
    );
    return result.rows[0] ?? null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("starter_offer_orders")
    .select("status, series_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error?.code === "42P01") {
    return null;
  }

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function requestStarterOfferRecord(userId: string) {
  if (usesPostgresDataBackend()) {
    const result = await queryDatabase<{ status: string; created: boolean }>(
      `
        with inserted as (
          insert into public.starter_offer_orders (user_id, price_rub, status)
          values ($1, $2, 'pending')
          on conflict (user_id) do nothing
          returning status
        )
        select status, true as created
        from inserted
        union all
        select status, false as created
        from public.starter_offer_orders
        where user_id = $1
          and not exists (select 1 from inserted)
        limit 1
      `,
      [userId, STARTER_OFFER.priceRub]
    );
    const record = result.rows[0];

    if (!record) {
      throw new Error("STARTER_OFFER_REQUEST_FAILED");
    }

    return record;
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing, error: selectError } = await supabase
    .from("starter_offer_orders")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existing) {
    return { status: existing.status, created: false };
  }

  const { data, error } = await supabase
    .from("starter_offer_orders")
    .insert({
      price_rub: STARTER_OFFER.priceRub,
      status: "pending",
      user_id: userId
    })
    .select("status")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "STARTER_OFFER_REQUEST_FAILED");
  }

  return { status: data.status, created: true };
}
