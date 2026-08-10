import { ChildrenList } from "@/components/children/children-list";
import { HouseSection } from "@/components/dashboard/house-section";
import { listChildrenByUser } from "@/lib/data/children";
import { requireUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function ChildrenPage() {
  const user = await requireUser();
  const childrenItems = await listChildrenByUser(user.id);

  return (
    <HouseSection
      room="gallery"
      eyebrow="Семейная галерея"
      title="Профиль ребёнка / детей"
    >
      <section aria-label="Семейная галерея">
        <ChildrenList childrenItems={childrenItems} />
      </section>
    </HouseSection>
  );
}
