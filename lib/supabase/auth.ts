import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const AUTH_REQUEST_ATTEMPTS = 2;

function waitBeforeRetry() {
  return new Promise((resolve) => setTimeout(resolve, 250));
}

export const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  for (let attempt = 1; attempt <= AUTH_REQUEST_ATTEMPTS; attempt += 1) {
    try {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (!error) {
        return user;
      }

      const isTemporaryError = !error.status || error.status >= 500;

      if (!isTemporaryError) {
        return null;
      }
    } catch {
      // Сетевой сбой повторяется ниже и не должен ломать серверный рендеринг.
    }

    if (attempt < AUTH_REQUEST_ATTEMPTS) {
      await waitBeforeRetry();
    }
  }

  console.warn("Проверка сессии временно недоступна после повторной попытки");
  return null;
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}
