import { signIn } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/supabase/auth";
import { redirectToNextOnboardingStep } from "@/lib/supabase/onboarding";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    await redirectToNextOnboardingStep(user.id);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <AuthForm
        action={signIn}
        title="Вход в кабинет"
        description="Войдите, чтобы создавать персональные сказки и хранить историю."
        submitLabel="Войти"
        alternateHref="/auth/sign-up"
        alternateLabel="Создать аккаунт"
        alternateText="Еще нет аккаунта?"
      />
    </main>
  );
}
