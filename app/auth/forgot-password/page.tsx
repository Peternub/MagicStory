import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import { PasswordResetForm } from "@/components/auth/password-reset-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-xl rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-8">
        <h1 className="text-3xl font-semibold text-[var(--text-main)]">Восстановление пароля</h1>
        <p className="mt-3 leading-7 text-[var(--text-soft)]">Укажите email, использованный при регистрации по паролю.</p>
        <PasswordResetForm action={requestPasswordReset} mode="request" />
        <Link href="/auth/login" className="mt-6 inline-flex text-sm font-medium text-[var(--logo-text)]">Вернуться ко входу</Link>
      </section>
    </main>
  );
}
