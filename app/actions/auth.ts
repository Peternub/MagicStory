"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirectToNextOnboardingStep } from "@/lib/supabase/onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authSchema } from "@/lib/validators/auth";

type AuthActionState = {
  error?: string;
  success?: string;
};

function mapAuthErrorMessage(message?: string, status?: number) {
  const normalized = (message ?? "").toLowerCase();

  if (status === 429 || normalized.includes("rate limit")) {
    return "Слишком много попыток регистрации за короткое время. Мы попробуем создать аккаунт другим способом.";
  }

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
    console.error("signIn error", {
      status: error.status,
      message: error.message
    });

    return {
      error:
        mapAuthErrorMessage(error.message, error.status) ??
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
    console.error("signUp error", {
      status: error.status,
      message: error.message
    });

    if (error.status === 429 || error.message.toLowerCase().includes("rate limit")) {
      const adminClient = createSupabaseAdminClient();
      const { data: createdUser, error: adminError } =
        await adminClient.auth.admin.createUser({
          email: parsed.data.email,
          password: parsed.data.password,
          email_confirm: true
        });

      if (adminError) {
        console.error("admin createUser error", {
          message: adminError.message
        });

        return {
          error:
            mapAuthErrorMessage(adminError.message) ??
            "Не удалось зарегистрироваться. Попробуйте еще раз чуть позже."
        };
      }

      if (createdUser.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword(
          parsed.data
        );

        if (signInError) {
          return {
            success:
              "Аккаунт создан. Теперь войдите в приложение с этим email и паролем."
          };
        }

        await redirectToNextOnboardingStep(createdUser.user.id);
        redirect("/dashboard");
      }
    }

    return {
      error:
        mapAuthErrorMessage(error.message, error.status) ??
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
