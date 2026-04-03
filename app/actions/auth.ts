"use server";

import { redirect } from "next/navigation";
import { redirectToNextOnboardingStep } from "@/lib/supabase/onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authSchema } from "@/lib/validators/auth";

type AuthActionState = {
  error?: string;
  success?: string;
};

function mapAuthErrorMessage(message?: string) {
  const normalized = (message ?? "").toLowerCase();

  if (
    normalized.includes("already registered") ||
    normalized.includes("user already registered")
  ) {
    return "Пользователь с таким email уже зарегистрирован.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Неверный email или пароль.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Подтвердите email и затем войдите в аккаунт.";
  }

  if (normalized.includes("password")) {
    return "Пароль не соответствует требованиям Supabase.";
  }

  return null;
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные"
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error:
        mapAuthErrorMessage(error.message) ??
        "Не удалось войти. Проверьте email и пароль."
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    await redirectToNextOnboardingStep(user.id);
  }

  redirect("/dashboard");
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные"
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return {
      error:
        mapAuthErrorMessage(error.message) ??
        "Не удалось зарегистрироваться. Проверьте email и пароль."
    };
  }

  if (data.session && data.user) {
    await redirectToNextOnboardingStep(data.user.id);
    redirect("/dashboard");
  }

  if (data.user && !data.session) {
    return {
      success:
        "Аккаунт создан. Если письмо подтверждения включено в Supabase, подтвердите email и затем войдите."
    };
  }

  return {
    success: "Аккаунт создан. Теперь войдите в приложение."
  };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
