import { signInWithGoogle } from "@/app/actions/auth";

export function GoogleAuthButton() {
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] px-4 py-4 text-lg font-semibold text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
      >
        Продолжить через Google
      </button>
    </form>
  );
}
