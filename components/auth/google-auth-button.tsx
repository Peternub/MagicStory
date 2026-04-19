"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function GoogleAuthButton() {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);

    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo
      }
    });

    if (error) {
      console.error("google auth error", error.message);
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] px-4 py-4 text-lg font-semibold text-[var(--text-main)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isPending ? "Переходим в Google..." : "Продолжить через Google"}
    </button>
  );
}
