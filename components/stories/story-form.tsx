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
  "w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] px-4 py-3 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)] caret-[var(--text-main)] outline-none transition focus:border-[var(--border-strong)] focus:ring-4 focus:ring-[var(--accent-gold-soft)]";

function formatGenderLabel(gender: ChildRecord["gender"]) {
  return gender === "girl" ? "девочка" : "мальчик";
}

export function StoryForm({ action, childrenItems }: StoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Для кого сказка
        </span>
        <select name="childId" defaultValue="" className={fieldClassName} required>
          <option value="" disabled>
            Выберите ребенка
          </option>
          {childrenItems.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}, {child.age} лет, {formatGenderLabel(child.gender)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Что произошло сегодня
        </span>
        <textarea
          name="situation"
          rows={4}
          placeholder="Например: устал, поссорился с другом или переживает перед садиком"
          className={fieldClassName}
          required
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Где будет происходить сказка
          </span>
          <input
            name="setting"
            type="text"
            required
            placeholder="Лесной домик, морской берег, волшебный город"
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Что должна дать сказка
          </span>
          <select
            name="goal"
            defaultValue="спокойно уснуть"
            className={fieldClassName}
          >
            <option value="спокойно уснуть">Спокойно уснуть</option>
            <option value="стать смелее">Стать смелее</option>
            <option value="помириться и подружиться">Помириться и подружиться</option>
            <option value="поверить в себя">Поверить в себя</option>
            <option value="прожить день мягче">Прожить день мягче</option>
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Длительность
          </span>
          <select name="durationMinutes" defaultValue="5" className={fieldClassName}>
            <option value="3">3 минуты</option>
            <option value="5">5 минут</option>
            <option value="7">7 минут</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Дополнительные пожелания
          </span>
          <input
            name="extraWishes"
            type="text"
            placeholder="Например: сделать сказку мягче и спокойнее"
            className={fieldClassName}
          />
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
        {isPending ? "Создаем сказку..." : "Создать сказку"}
      </button>

      {isPending ? (
        <div
          className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] px-4 py-3"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-soft)]">
            <span>Сказка создается</span>
            <span>Пожалуйста, подождите</span>
          </div>
          <div className="story-loading mt-3">
            <div className="story-loading__bar" />
          </div>
        </div>
      ) : null}
    </form>
  );
}
