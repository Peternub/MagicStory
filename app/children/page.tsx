import Link from "next/link";
import { ChildrenList } from "@/components/children/children-list";
import { AccountPageShell } from "@/components/dashboard/house-section";
import type { ChildRecord } from "@/lib/types/database";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ChildrenPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("children")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const childrenItems = (data ?? []) as ChildRecord[];

  return (
    <AccountPageShell
      title="Профили детей"
      actions={
        <Link
          href="/children/new"
          className="account-primary-button"
        >
          Добавить ребёнка
        </Link>
      }
    >
      <section aria-label="Семейная галерея">
        <ChildrenList childrenItems={childrenItems} />
      </section>
    </AccountPageShell>
  );
}
