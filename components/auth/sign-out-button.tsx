import { signOut } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-full border border-brand-300 px-4 py-2 text-sm text-brand-900 transition hover:border-brand-500"
      >
        Выйти
      </button>
    </form>
  );
}
