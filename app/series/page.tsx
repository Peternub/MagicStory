import Link from "next/link";
import { AccountPageShell } from "@/components/dashboard/house-section";
import {
  SeriesLibrary,
  type SeriesLibraryItem
} from "@/components/stories/series-library";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SeriesRow = {
  children?: Array<{ name: string }>;
  id: string;
  stories?: Array<{ count: number }>;
  title: string;
  updated_at: string;
};

export default async function SeriesPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("story_series")
    .select("id, title, updated_at, children(name), stories(count)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const items: SeriesLibraryItem[] = ((data ?? []) as SeriesRow[]).map((series) => ({
    childName: series.children?.[0]?.name ?? "Персональный сериал",
    episodesCount: series.stories?.[0]?.count ?? 0,
    id: series.id,
    title: series.title,
    updatedAt: series.updated_at
  }));

  return (
    <AccountPageShell
      title="Библиотека"
      actions={
        <Link href="/series/new" className="account-primary-button">
          Добавить сериал
        </Link>
      }
    >
      <SeriesLibrary items={items} />
    </AccountPageShell>
  );
}
