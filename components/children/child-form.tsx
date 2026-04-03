"use client";

import { useActionState } from "react";

type ChildActionState = {
  error?: string;
};

type ChildFormProps = {
  action: (
    state: ChildActionState,
    formData: FormData
  ) => Promise<ChildActionState>;
};

const initialState: ChildActionState = {};

export function ChildForm({ action }: ChildFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm text-brand-900">Имя ребенка</span>
        <input
          name="name"
          type="text"
          required
          className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 outline-none transition focus:border-brand-400"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-brand-900">Возраст</span>
        <input
          name="age"
          type="number"
          min={3}
          max={10}
          required
          className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 outline-none transition focus:border-brand-400"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-brand-900">Интересы</span>
        <textarea
          name="interests"
          rows={3}
          className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 outline-none transition focus:border-brand-400"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-brand-900">Страхи</span>
        <textarea
          name="fears"
          rows={3}
          className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 outline-none transition focus:border-brand-400"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-brand-900">
          Дополнительный контекст
        </span>
        <textarea
          name="additional_context"
          rows={4}
          className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 outline-none transition focus:border-brand-400"
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
        {isPending ? "Сохраняем..." : "Сохранить профиль"}
      </button>
    </form>
  );
}
