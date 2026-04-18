import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <AuthForm
        action={signUp}
        title="Регистрация"
        description="Создайте аккаунт, чтобы получить доступ к персональным сказкам."
        submitLabel="Зарегистрироваться"
        alternateHref="/auth/login"
        alternateLabel="Войти"
        alternateText="Уже есть аккаунт?"
        showNameFields
      />
    </main>
  );
}
