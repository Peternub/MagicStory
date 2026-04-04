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

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-[#0f091a] px-4 py-3 text-base text-white placeholder:text-white/35 caret-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20";

export function ChildForm({ action }: ChildFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Имя ребенка
        </span>
        <input
          name="name"
          type="text"
          required
          placeholder="Пётр"
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Возраст
        </span>
        <input
          name="age"
          type="number"
          min={3}
          max={10}
          required
          placeholder="6"
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Интересы
        </span>
        <textarea
          name="interests"
          rows={3}
          placeholder="Любит истории про космос, машинки и водное поло"
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Страхи
        </span>
        <textarea
          name="fears"
          rows={3}
          placeholder="Темнота, громкие звуки, поход к врачу"
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Дополнительный контекст
        </span>
        <textarea
          name="additional_context"
          rows={4}
          placeholder="Любимая игрушка Аркадий, лучше засыпает под спокойный голос"
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
        {isPending ? "Сохраняем..." : "Сохранить профиль"}
      </button>
    </form>
  );
}
