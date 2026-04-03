import { signOut } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-brand-300 hover:text-white"
      >
        Выйти
      </button>
    </form>
  );
}
