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
          "rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-brand-300 hover:text-white"
        }
      >
        Выйти
      </button>
    </form>
  );
}
