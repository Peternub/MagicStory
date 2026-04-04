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
  "w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-base text-brand-900 placeholder:text-brand-400 caret-brand-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-200/40";

export function StoryForm({ action, childrenItems }: StoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-brand-900">
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
        <span className="mb-2 block text-sm font-medium text-brand-900">
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
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
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
