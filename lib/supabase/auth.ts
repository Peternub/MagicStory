import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error) {
      console.error("getCurrentUser error", {
        status: error.status,
        message: error.message
      });
      return null;
    }

    return user;
  } catch (error) {
    console.error("getCurrentUser request failed", error);
    return null;
  }
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}
