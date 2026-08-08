"use client";

import { useActionState, useEffect, useRef } from "react";

type GenerationRecoveryProps = {
  action: (
    state: { error?: string },
    formData: FormData
  ) => Promise<{ error?: string }>;
  autoStart?: boolean;
  storyId: string;
  status: string;
};

export function GenerationRecovery({
  action,
  autoStart = false,
  storyId,
  status
}: GenerationRecoveryProps) {
  const [state, formAction, isPending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (autoStart && !startedRef.current) {
      startedRef.current = true;
      formRef.current?.requestSubmit();
    }
  }, [autoStart]);

  const label = status === "failed" ? "Повторить" : "Продолжить генерацию";

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="storyId" value={storyId} />
      <button
        type="submit"
        disabled={isPending}
        className="house-primary-button w-full disabled:opacity-70"
      >
        {isPending ? "Создаём серию..." : label}
      </button>
      {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
    </form>
  );
}
