"use server";

import { revalidatePath } from "next/cache";
import { STARTER_OFFER } from "@/lib/config/starter-offer";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth";

export type StarterOfferActionState = { error?: string; message?: string };

export async function requestStarterOffer(): Promise<StarterOfferActionState> {
  const user = await requireUser();
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("starter_offer_orders")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return {
      message: existing.status === "paid"
        ? "Пакет уже оплачен и доступен."
        : "Заявка уже создана. Оплата появится после подключения кассы."
    };
  }

  const { error } = await supabase.from("starter_offer_orders").insert({
    price_rub: STARTER_OFFER.priceRub,
    status: "pending",
    user_id: user.id
  });

  if (error) {
    console.warn("Не удалось создать заявку на разовый пакет", error.message);
    return { error: "Не удалось создать заявку. Проверьте подключение базы данных." };
  }

  revalidatePath("/series/new");
  revalidatePath("/billing");
  return { message: "Заявка создана. Оплата появится после подключения кассы." };
}
