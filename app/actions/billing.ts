"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BillingActionState = {
  error?: string;
  success?: string;
};

export async function createSubscriptionRequest(
  _prevState: BillingActionState,
  formData: FormData
): Promise<BillingActionState> {
  const user = await requireUser();
  const planId = formData.get("planId");

  if (typeof planId !== "string" || !planId) {
    return {
      error: "Не удалось определить тариф"
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("id, status")
    .eq("user_id", user.id)
    .in("status", ["pending", "active", "past_due"])
    .maybeSingle();

  if (existingSubscription) {
    return {
      error: "У вас уже есть активная или ожидающая подписка"
    };
  }

  const { error: subscriptionError } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    plan_id: planId,
    status: "pending"
  });

  if (subscriptionError) {
    return {
      error: "Не удалось создать заявку на подписку"
    };
  }

  revalidatePath("/billing");
  revalidatePath("/dashboard");

  return {
    success: "Заявка на подписку создана. Следующим шагом подключим YooKassa."
  };
}
