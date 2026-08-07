import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type StarterOfferStatus = "available" | "pending" | "ready" | "used";

export async function getStarterOfferStatus(userId: string): Promise<StarterOfferStatus> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("starter_offer_orders")
    .select("status, series_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error?.code === "42P01") {
    return "available";
  }

  if (!data) {
    return "available";
  }

  if (data.series_id || data.status === "used") {
    return "used";
  }

  return data.status === "paid" ? "ready" : "pending";
}
