"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureUserProfile } from "@/lib/account/ensure-profile";
import { MAX_CHILD_PROFILES } from "@/lib/config/children";
import {
  countChildrenByUser,
  createChildRecord,
  deleteChildRecord,
  updateChildRecord
} from "@/lib/data/children";
import { requireUser } from "@/lib/auth/server";
import { childSchema } from "@/lib/validators/children";

type ChildActionState = {
  error?: string;
};

export async function createChild(
  _prevState: ChildActionState,
  formData: FormData
): Promise<ChildActionState> {
  const user = await requireUser();
  await ensureUserProfile(user.id, user.email);
  const parsed = childSchema.safeParse({
    name: formData.get("name"),
    age: formData.get("age"),
    gender: formData.get("gender"),
    interests: formData.get("interests"),
    fears: formData.get("fears"),
    additional_context: formData.get("additionalContext")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные"
    };
  }

  let childrenCount: number;
  try {
    childrenCount = await countChildrenByUser(user.id);
  } catch {
    return { error: "Не удалось проверить количество профилей" };
  }

  if (childrenCount >= MAX_CHILD_PROFILES) {
    return { error: `Можно создать не больше ${MAX_CHILD_PROFILES} профилей детей` };
  }

  const result = await createChildRecord(user.id, parsed.data);

  if (!result.ok) {
    if (result.reason === "limit") {
      return { error: `Можно создать не больше ${MAX_CHILD_PROFILES} профилей детей` };
    }

    if (result.reason === "missing_gender") {
      return {
        error: "В базе не применена миграция пола ребенка. Примените 20260420_006_add_child_gender.sql."
      };
    }

    console.error("createChild insert error");

    return {
      error: "Не удалось сохранить профиль ребенка"
    };
  }

  revalidatePath("/children");
  revalidatePath("/series/new");
  redirect("/children");
}

export async function updateChild(
  _prevState: ChildActionState,
  formData: FormData
): Promise<ChildActionState> {
  const user = await requireUser();
  const childId = formData.get("childId");

  if (typeof childId !== "string" || !childId) {
    return {
      error: "Не удалось найти профиль ребенка"
    };
  }

  const parsed = childSchema.safeParse({
    name: formData.get("name"),
    age: formData.get("age"),
    gender: formData.get("gender"),
    interests: formData.get("interests"),
    fears: formData.get("fears"),
    additional_context: formData.get("additionalContext")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные"
    };
  }

  const result = await updateChildRecord(user.id, childId, parsed.data);

  if (!result.ok) {
    if (result.reason === "missing_gender") {
      return {
        error: "В базе не применена миграция пола ребенка. Примените 20260420_006_add_child_gender.sql."
      };
    }

    console.error("updateChild error");

    return {
      error: "Не удалось обновить профиль ребенка"
    };
  }

  revalidatePath("/children");
  revalidatePath("/series/new");
  redirect("/children");
}

export async function deleteChild(formData: FormData) {
  const user = await requireUser();
  const childId = formData.get("childId");

  if (typeof childId !== "string" || !childId) {
    return;
  }

  await deleteChildRecord(user.id, childId);

  revalidatePath("/children");
  revalidatePath("/series/new");
}
