"use client";

import { useActionState } from "react";
import type { ChildRecord } from "@/lib/types/database";

type ChildActionState = {
  error?: string;
};

type ChildFormProps = {
  action: (
    state: ChildActionState,
    formData: FormData
  ) => Promise<ChildActionState>;
  child?: Pick<ChildRecord, "id" | "name" | "age" | "gender">;
  submitLabel?: string;
  pendingLabel?: string;
};

const initialState: ChildActionState = {};

const fieldClassName =
  "w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] px-4 py-3 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)] caret-[var(--text-main)] outline-none transition focus:border-[var(--border-strong)] focus:ring-4 focus:ring-[var(--accent-gold-soft)]";

export function ChildForm({
  action,
  child,
  submitLabel = "Сохранить профиль",
  pendingLabel = "Сохраняем..."
}: ChildFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {child ? <input type="hidden" name="childId" value={child.id} /> : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Имя ребенка
        </span>
        <input
          name="name"
          type="text"
          required
          placeholder="Петя"
          defaultValue={child?.name ?? ""}
          className={fieldClassName}
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Возраст
          </span>
          <input
            name="age"
            type="number"
            min={3}
            max={12}
            required
            placeholder="6"
            defaultValue={child?.age ?? ""}
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Пол
          </span>
          <select name="gender" defaultValue={child?.gender ?? "boy"} className={fieldClassName}>
            <option value="boy">Мальчик</option>
            <option value="girl">Девочка</option>
          </select>
        </label>
      </div>

      {state.error ? (
        <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[var(--button-dark)] px-4 py-3 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
