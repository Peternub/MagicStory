"use client";

import { useActionState } from "react";
import type { ChildRecord } from "@/lib/types/database";

type SeriesActionState = { error?: string };

type SeriesFormProps = {
  action: (state: SeriesActionState, formData: FormData) => Promise<SeriesActionState>;
  childrenItems: ChildRecord[];
};

const initialState: SeriesActionState = {};
const fieldClassName =
  "w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] px-4 py-3 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--border-strong)] focus:ring-4 focus:ring-[var(--accent-gold-soft)]";

export function SeriesForm({ action, childrenItems }: SeriesFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">Для кого сериал</span>
        <select name="childId" defaultValue={childrenItems[0]?.id} className={fieldClassName}>
          {childrenItems.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}, {child.age} лет
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">Название сериала</span>
        <input name="title" required maxLength={120} placeholder="Приключения Миши и звездолета" className={fieldClassName} />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">О чем будет сериал</span>
        <textarea
          name="premise"
          required
          rows={4}
          maxLength={600}
          placeholder="Кто главные герои, где они живут и что любят делать"
          className={fieldClassName}
        />
      </label>

      {state.error ? (
        <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[var(--button-dark)] px-4 py-4 font-semibold text-[var(--button-dark-text)] disabled:opacity-70"
      >
        {isPending ? "Создаем сериал..." : "Создать сериал"}
      </button>
    </form>
  );
}
