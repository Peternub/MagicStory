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

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-[var(--text-main)]">Кто главный герой</legend>
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] p-1">
          <label className="cursor-pointer">
            <input className="peer sr-only" type="radio" name="protagonistMode" value="child" defaultChecked />
            <span className="flex min-h-11 items-center justify-center rounded-md px-3 text-center text-sm text-[var(--text-soft)] transition peer-checked:bg-[var(--button-dark)] peer-checked:text-[var(--button-dark-text)]">
              Ребёнок
            </span>
          </label>
          <label className="cursor-pointer">
            <input className="peer sr-only" type="radio" name="protagonistMode" value="series_cast" />
            <span className="flex min-h-11 items-center justify-center rounded-md px-3 text-center text-sm text-[var(--text-soft)] transition peer-checked:bg-[var(--button-dark)] peer-checked:text-[var(--button-dark-text)]">
              Другие герои
            </span>
          </label>
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">Название сериала</span>
        <input name="title" required maxLength={120} placeholder="Сонный город Маши" className={fieldClassName} />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">Главная идея</span>
        <textarea
          name="premise"
          required
          rows={3}
          maxLength={600}
          placeholder="Например: каждый вечер ребёнок становится главным героем нового приключения в знакомом дворе"
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">Места и атмосфера</span>
        <textarea
          name="setting"
          rows={2}
          maxLength={220}
          placeholder="Дом, садик, двор, комната, любимая площадка, спокойный тон перед сном"
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">Постоянные герои и связь с ребёнком</span>
        <textarea
          name="mainCharacters"
          rows={2}
          maxLength={400}
          placeholder="Например: Миша — друг из садика, Аня — старшая сестра, Барсик — домашний кот"
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">Дополнительные пожелания (не обязательно)</span>
        <textarea
          name="additionalWishes"
          rows={2}
          maxLength={400}
          placeholder="Что ребенку нравится, чего лучше избегать, какие слова или темы не использовать"
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
        {isPending ? "Создаем сериал..." : "Создать сериал и перейти к первой серии"}
      </button>
    </form>
  );
}
