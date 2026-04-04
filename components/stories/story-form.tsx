"use client";

import { useActionState } from "react";
import type { ChildRecord } from "@/lib/types/database";

type StoryActionState = {
  error?: string;
};

type StoryFormProps = {
  action: (
    state: StoryActionState,
    formData: FormData
  ) => Promise<StoryActionState>;
  childrenItems: ChildRecord[];
};

const initialState: StoryActionState = {};

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-[#0f091a] px-4 py-3 text-base text-white placeholder:text-white/35 caret-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20";

export function StoryForm({ action, childrenItems }: StoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Ребенок
        </span>
        <select
          name="childId"
          required
          className={fieldClassName}
          defaultValue=""
        >
          <option value="" disabled>
            Выберите профиль
          </option>
          {childrenItems.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}, {child.age} лет
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Тема сегодняшнего дня
        </span>
        <textarea
          name="theme"
          rows={5}
          required
          placeholder="Например: не хотел убирать игрушки и сильно расстроился"
          className={fieldClassName}
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Создаем сказку..." : "Создать сказку"}
      </button>
    </form>
  );
}
