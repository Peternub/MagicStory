import { updatePassword } from "@/app/actions/auth";
import { PasswordResetForm } from "@/components/auth/password-reset-form";

export default function UpdatePasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-xl rounded-lg border border-[var(--border-soft)] bg-[var(--surface-primary)] p-8">
        <h1 className="text-3xl font-semibold text-[var(--text-main)]">Новый пароль</h1>
        <p className="mt-3 leading-7 text-[var(--text-soft)]">Придумайте новый пароль длиной не менее восьми символов.</p>
        <PasswordResetForm action={updatePassword} mode="update" />
      </section>
    </main>
  );
}
