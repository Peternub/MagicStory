"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { childSchema } from "@/lib/validators/children";

type ChildActionState = {
  error?: string;
};

export async function createChild(
  _prevState: ChildActionState,
  formData: FormData
): Promise<ChildActionState> {
  const user = await requireUser();
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

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("children").insert({
    ...parsed.data,
    user_id: user.id
  });

  if (error) {
    return {
      error: "Не удалось сохранить профиль ребенка"
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
