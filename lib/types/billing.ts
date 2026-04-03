export type SubscriptionPlan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price_rub: number;
  stories_limit: number;
  is_active: boolean;
};

export type SubscriptionRecord = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  external_customer_id: string | null;
  external_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};
