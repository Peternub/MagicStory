"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureUserProfile } from "@/lib/account/ensure-profile";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isMissingColumnError } from "@/lib/supabase/errors";
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
    gender: formData.get("gender")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные"
    };
  }

  const supabase = createSupabaseAdminClient();
  const childPayload = {
    ...parsed.data,
    user_id: user.id
  };
  const { error } = await supabase.from("children").insert(childPayload);

  if (error) {
    if (isMissingColumnError(error, "gender")) {
      return {
        error: "В базе не применена миграция пола ребенка. Примените 20260420_006_add_child_gender.sql."
      };
    }

    console.error("createChild insert error", {
      userId: user.id,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });

    return {
      error: "Не удалось сохранить профиль ребенка"
    };
  }

  revalidatePath("/children");
  revalidatePath("/stories/new");
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
    gender: formData.get("gender")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные"
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("children")
    .update(parsed.data)
    .eq("id", childId)
    .eq("user_id", user.id);

  if (error) {
    if (isMissingColumnError(error, "gender")) {
      return {
        error: "В базе не применена миграция пола ребенка. Примените 20260420_006_add_child_gender.sql."
      };
    }

    console.error("updateChild error", {
      userId: user.id,
      childId,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });

    return {
      error: "Не удалось обновить профиль ребенка"
    };
  }

  revalidatePath("/children");
  revalidatePath("/stories/new");
  redirect("/children");
}

export async function deleteChild(formData: FormData) {
  const user = await requireUser();
  const childId = formData.get("childId");

  if (typeof childId !== "string" || !childId) {
    return;
  }

  const supabase = await createSupabaseServerClient();

  await supabase
    .from("children")
    .delete()
    .eq("id", childId)
    .eq("user_id", user.id);

  revalidatePath("/children");
  revalidatePath("/stories/new");
}
