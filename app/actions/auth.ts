"use server";

import { redirect } from "next/navigation";
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

  if (normalized.includes("invalid login credentials")) {
    return "Неверный email или пароль.";
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

  const adminClient = createSupabaseAdminClient();
  const { data: createdUser, error } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: userMetadata
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

  if (!createdUser.user) {
    return {
      error: "Не удалось зарегистрироваться. Попробуйте еще раз."
    };
  }

  const supabase = await createSupabaseServerClient();
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

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
