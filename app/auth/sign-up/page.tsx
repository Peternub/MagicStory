import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/supabase/auth";
import { redirectToNextOnboardingStep } from "@/lib/supabase/onboarding";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const user = await getCurrentUser();

  if (user) {
    await redirectToNextOnboardingStep(user.id);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <AuthForm
        action={signUp}
        title="Регистрация"
        description="Создайте аккаунт родителя, чтобы начать работу с сервисом."
        submitLabel="Зарегистрироваться"
        alternateHref="/auth/login"
        alternateLabel="Войти"
        alternateText="Уже есть аккаунт?"
      />
    </main>
  );
}
