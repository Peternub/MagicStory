import { signOut } from "@/app/actions/auth";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={
          className ??
          "rounded-lg border border-[var(--border-soft)] px-4 py-2 text-sm text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
        }
      >
        Выйти
      </button>
    </form>
  );
}
