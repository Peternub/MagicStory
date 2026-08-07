import Link from "next/link";
import { createSeries } from "@/app/actions/series";
import { StarterOfferButton } from "@/components/billing/starter-offer-button";
import { SeriesForm } from "@/components/stories/series-form";
import { STARTER_OFFER } from "@/lib/config/starter-offer";
import { getStarterOfferStatus } from "@/lib/payments/starter-offer";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ChildRecord } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function NewSeriesPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("children")
    .select("*")
    .eq("user_id", user.id)
    .order("name");
  const childrenItems = (data ?? []) as ChildRecord[];
  const starterOfferStatus = await getStarterOfferStatus(user.id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-6 sm:px-10 sm:py-10">
      <Link href="/series" className="text-sm font-medium text-[var(--logo-text)]">
        Назад к сериалам
      </Link>
      <section className="mt-5 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-5 sm:mt-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-[var(--text-main)] sm:text-3xl">Новый вечерний сериал</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
          Один раз задайте героев, мир и правила. Потом каждый вечер достаточно нажать одну кнопку.
        </p>
        {starterOfferStatus !== "used" ? (
          <div className="mt-6 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-secondary)] p-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="font-semibold text-[var(--text-main)]">
                {STARTER_OFFER.name} — {STARTER_OFFER.priceRub} ₽
              </p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                {starterOfferStatus === "ready"
                  ? "Оплачено. Выберите 3 серии в форме."
                  : starterOfferStatus === "pending"
                    ? "Заявка создана. Ожидает подключения оплаты."
                    : "Разовая покупка, один раз на аккаунт."}
              </p>
            </div>
            {starterOfferStatus === "available" ? (
              <div className="mt-4 sm:mt-0 sm:min-w-48"><StarterOfferButton /></div>
            ) : null}
          </div>
        ) : null}
        <div className="mt-6 sm:mt-8">
          {childrenItems.length > 0 ? (
            <SeriesForm
              action={createSeries}
              childrenItems={childrenItems}
              starterOfferReady={starterOfferStatus === "ready"}
            />
          ) : (
            <Link href="/children/new" className="text-[var(--logo-text)]">Сначала добавьте ребенка</Link>
          )}
        </div>
      </section>
    </main>
  );
}
