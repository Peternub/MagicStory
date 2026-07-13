import { signIn } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    reason?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, reason } = await searchParams;
  const initialError =
    error === "oauth"
      ? `Google не передал действующую сессию${reason ? `: ${reason}` : "."}`
      : error === "oauth_start"
        ? "Не удалось начать вход через Google. Проверьте настройки Google в Supabase."
      : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <AuthForm
        action={signIn}
        title="Вход в кабинет"
        description="Войдите, чтобы создавать персональные сериалы и хранить серии."
        submitLabel="Войти"
        alternateHref="/auth/sign-up"
        alternateLabel="Создать аккаунт"
        alternateText="Еще нет аккаунта?"
        initialError={initialError}
        recoveryHref="/auth/forgot-password"
      />
    </main>
  );
}
