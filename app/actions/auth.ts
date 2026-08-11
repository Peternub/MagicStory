"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAuthEnabled } from "@/lib/auth/config";
import {
  passwordResetRequestSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema
} from "@/lib/validators/auth";

type AuthActionState = {
  error?: string;
  success?: string;
};

const AUTH_DISABLED_MESSAGE =
  "Регистрация и вход временно закрыты до подключения защищённого HTTPS-соединения.";

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
      error: parsed.error.issues[0]?.message ?? "Проверьте введённые данные."
    };
  }

  if (!isAuthEnabled()) {
    return { error: AUTH_DISABLED_MESSAGE };
  }

  const { localAuth } = await import("@/lib/auth/local");

  try {
    await localAuth.api.signInEmail({
      body: parsed.data,
      headers: await headers()
    });
  } catch {
    return { error: "Неверный email или пароль." };
  }

  redirect("/dashboard");
}

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = passwordResetRequestSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте email" };
  }

  if (!isAuthEnabled()) {
    return { error: AUTH_DISABLED_MESSAGE };
  }

  return {
    error: "Восстановление пароля будет доступно после подключения почтовой отправки."
  };
}

export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm")
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте новый пароль" };
  }

  return {
    error: isAuthEnabled()
      ? "Ссылка для смены пароля недействительна. Запросите новую ссылку."
      : AUTH_DISABLED_MESSAGE
  };
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
      error: parsed.error.issues[0]?.message ?? "Проверьте введённые данные."
    };
  }

  if (!isAuthEnabled()) {
    return { error: AUTH_DISABLED_MESSAGE };
  }

  const { localAuth } = await import("@/lib/auth/local");

  try {
    await localAuth.api.signUpEmail({
      body: {
        name: `${parsed.data.firstName} ${parsed.data.lastName}`,
        email: parsed.data.email,
        password: parsed.data.password
      },
      headers: await headers()
    });
  } catch {
    return {
      error: "Не удалось зарегистрироваться. Возможно, этот email уже используется."
    };
  }

  redirect("/dashboard");
}

export async function signOut() {
  if (isAuthEnabled()) {
    const { localAuth } = await import("@/lib/auth/local");
    await localAuth.api.signOut({ headers: await headers() });
  }

  redirect("/auth/login");
}
