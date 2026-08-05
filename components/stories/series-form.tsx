"use client";

import { useActionState } from "react";
import type { ChildRecord } from "@/lib/types/database";

type SeriesActionState = { error?: string };

type SeriesFormProps = {
  action: (state: SeriesActionState, formData: FormData) => Promise<SeriesActionState>;
  childrenItems: ChildRecord[];
};

const initialState: SeriesActionState = {};
const quickIdeas = [
  { value: "magic", label: "Волшебное приключение" },
  { value: "space", label: "Космическое путешествие" },
  { value: "mystery", label: "Тайна рядом с домом" },
  { value: "friendship", label: "История о дружбе" }
] as const;
const fieldClassName =
  "w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] px-4 py-3 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--border-strong)] focus:ring-4 focus:ring-[var(--accent-gold-soft)]";

export function SeriesForm({ action, childrenItems }: SeriesFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} autoComplete="off" className="space-y-5">
      {childrenItems.length === 1 ? (
        <div>
          <input type="hidden" name="childId" value={childrenItems[0].id} />
          <p className="text-sm text-[var(--text-soft)]">
            Сериал для <span className="font-semibold text-[var(--text-main)]">{childrenItems[0].name}</span>
          </p>
        </div>
      ) : (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">Для кого</span>
          <select name="childId" defaultValue={childrenItems[0]?.id} className={fieldClassName}>
            {childrenItems.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}, {child.age} лет
              </option>
            ))}
          </select>
        </label>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-[var(--text-main)]">Выберите идею</legend>
        <div className="grid overflow-hidden rounded-lg border border-[var(--border-soft)] sm:grid-cols-2">
          {quickIdeas.map((idea, index) => (
            <label
              key={idea.value}
              className={`cursor-pointer ${
                index > 0 ? "border-t border-[var(--border-soft)]" : ""
              } ${index % 2 === 1 ? "sm:border-l" : ""} ${index > 1 ? "sm:border-t" : "sm:border-t-0"}`}
            >
              <input
                type="radio"
                name="quickIdea"
                value={idea.value}
                defaultChecked={index === 0}
                className="peer sr-only"
              />
              <span className="flex min-h-14 items-center px-4 py-3 text-sm text-[var(--text-soft)] transition peer-checked:bg-[var(--accent-gold-soft)] peer-checked:font-semibold peer-checked:text-[var(--text-main)]">
                {idea.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Своя идея <span className="font-normal text-[var(--text-muted)]">необязательно</span>
        </span>
        <textarea
          name="premise"
          autoComplete="off"
          rows={2}
          maxLength={600}
          placeholder="Например: найти пропавший фонарь во дворе"
          className={fieldClassName}
        />
      </label>

      <details className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3">
        <summary className="cursor-pointer list-none text-sm font-medium text-[var(--text-soft)] marker:hidden">
          Дополнительные настройки
          <span aria-hidden="true" className="float-right">+</span>
        </summary>
        <div className="mt-4 grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--text-soft)]">Название</span>
            <input name="title" autoComplete="off" maxLength={120} className={fieldClassName} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--text-soft)]">Места и атмосфера</span>
            <textarea name="setting" autoComplete="off" rows={2} maxLength={220} className={fieldClassName} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--text-soft)]">Постоянные герои</span>
            <textarea name="mainCharacters" autoComplete="off" rows={2} maxLength={400} className={fieldClassName} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-[var(--text-soft)]">Дополнительные пожелания</span>
            <textarea name="additionalWishes" autoComplete="off" rows={2} maxLength={400} className={fieldClassName} />
          </label>
        </div>
      </details>

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
        {isPending ? "Создаём сериал..." : "Создать сериал"}
      </button>
    </form>
  );
}
