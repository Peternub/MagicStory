import "server-only";
import { getStarterOfferRecord } from "@/lib/data/billing";

export type StarterOfferStatus = "available" | "pending" | "ready" | "used";

export async function getStarterOfferStatus(userId: string): Promise<StarterOfferStatus> {
  const data = await getStarterOfferRecord(userId);

  if (!data) {
    return "available";
  }

  if (data.series_id || data.status === "used") {
    return "used";
  }

  return data.status === "paid" ? "ready" : "pending";
}
