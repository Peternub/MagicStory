import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
      <AuthForm
        action={signUp}
        title="Регистрация"
        description="Создайте аккаунт, чтобы получить доступ к персональным сериалам."
        submitLabel="Зарегистрироваться"
        alternateHref="/auth/login"
        alternateLabel="Войти"
        alternateText="Уже есть аккаунт?"
        showNameFields
      />
    </main>
  );
}
