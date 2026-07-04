import { signIn } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const initialError =
    error === "oauth"
      ? "Google не передал действующую сессию. Попробуйте войти через Google еще раз."
      : undefined;

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
        initialError={initialError}
      />
    </main>
  );
}
