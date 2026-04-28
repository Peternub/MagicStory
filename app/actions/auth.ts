"use server";

import { redirect } from "next/navigation";
import { ensureUserProfile } from "@/lib/account/ensure-profile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validators/auth";

type AuthActionState = {
  error?: string;
  success?: string;
};

function mapAuthErrorMessage(message?: string, status?: number) {
  const normalized = (message ?? "").toLowerCase();

  if (status === 429 || normalized.includes("rate limit")) {
    return "Слишком много попыток за короткое время. Попробуйте еще раз чуть позже.";
  }

  if (
    normalized.includes("already registered") ||
    normalized.includes("user already registered")
  ) {
    return "Пользователь с таким email уже зарегистрирован.";
  }

  if (normalized.includes("email signups are disabled")) {
    return "В Supabase выключена регистрация по email/password. Включите Email provider в Authentication → Providers → Email.";
  }

  if (normalized.includes("email logins are disabled")) {
    return "В Supabase выключен вход по email/password. Включите Email provider в Authentication → Providers → Email.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "Неверный email или пароль.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Email не подтвержден. Попробуйте войти еще раз или обратитесь в поддержку.";
  }

  if (normalized.includes("password")) {
    return "Пароль не соответствует требованиям Supabase.";
  }

  return null;
}

async function confirmUserEmail(userId: string) {
  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    email_confirm: true
  });

  if (error) {
    console.error("confirmUserEmail error", {
      userId,
      status: error.status,
      message: error.message
    });
  }
}

export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные."
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

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

  if (data.user) {
    await ensureUserProfile(data.user.id, data.user.email);
  }

  redirect("/dashboard");
}

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Проверьте введенные данные."
    };
  }

  const userMetadata = {
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    full_name: `${parsed.data.firstName} ${parsed.data.lastName}`
  };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: userMetadata
    }
  });

  if (error) {
    console.error("signUp error", {
      status: error.status,
      message: error.message
    });

    return {
      error:
        mapAuthErrorMessage(error.message, error.status) ??
        "Не удалось зарегистрироваться. Проверьте email и пароль."
    };
  }

  if (!data.user) {
    return {
      error: "Не удалось зарегистрироваться. Попробуйте еще раз."
    };
  }

  if (data.user.identities?.length === 0) {
    return {
      error: "Пользователь с таким email уже зарегистрирован. Войдите через форму входа."
    };
  }

  await ensureUserProfile(data.user.id, data.user.email ?? parsed.data.email);

  if (!data.session) {
    await confirmUserEmail(data.user.id);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password
    });

    if (signInError) {
      return {
        error:
          mapAuthErrorMessage(signInError.message, signInError.status) ??
          "Аккаунт создан, но не удалось сразу выполнить вход."
      };
    }
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
