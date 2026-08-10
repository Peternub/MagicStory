"use server";

import { revalidatePath } from "next/cache";
import { ensureUserProfile } from "@/lib/account/ensure-profile";
import { requestStarterOfferRecord } from "@/lib/data/billing";
import { requireUser } from "@/lib/auth/server";

export type StarterOfferActionState = { error?: string; message?: string };

export async function requestStarterOffer(): Promise<StarterOfferActionState> {
  const user = await requireUser();
  await ensureUserProfile(user.id, user.email);

  try {
    const result = await requestStarterOfferRecord(user.id);

    if (!result.created) {
      return {
        message: result.status === "paid"
          ? "Пакет уже оплачен и доступен."
          : "Заявка уже создана. Оплата появится после подключения кассы."
      };
    }
  } catch {
    return {
      error: "Не удалось создать заявку. Проверьте подключение базы данных."
    };
  }

  revalidatePath("/series/new");
  revalidatePath("/billing");
  return { message: "Заявка создана. Оплата появится после подключения кассы." };
}
