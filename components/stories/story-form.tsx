"use client";

import { useActionState, useState } from "react";
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

const storyModes = [
  {
    value: "sleep",
    title: "Спокойно уснуть",
    description: "Тихая вечерняя история"
  },
  {
    value: "situation",
    title: "Разобрать ситуацию",
    description: "Помочь прожить события дня"
  },
  {
    value: "adventure",
    title: "Новое приключение",
    description: "Веселый сюжет без подготовки"
  }
] as const;

export function StoryForm({ action, childrenItems }: StoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [mode, setMode] = useState<(typeof storyModes)[number]["value"]>("sleep");
  const [showDetails, setShowDetails] = useState(false);
  const defaultChild = childrenItems[0];

  return (
    <form action={formAction} className="space-y-6">
      {childrenItems.length === 1 ? (
        <input type="hidden" name="childId" value={defaultChild.id} />
      ) : (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Для кого история
          </span>
          <select name="childId" defaultValue={defaultChild.id} className={fieldClassName}>
            {childrenItems.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}, {child.age} лет
              </option>
            ))}
          </select>
        </label>
      )}

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-[var(--text-main)]">
          Что нужно сегодня
        </legend>
        <div className="grid gap-3 md:grid-cols-3">
          {storyModes.map((item) => {
            const isActive = mode === item.value;

            return (
              <label
                key={item.value}
                className={`cursor-pointer rounded-lg border p-4 transition ${
                  isActive
                    ? "border-[var(--border-strong)] bg-[var(--accent-gold-soft)]"
                    : "border-[var(--border-soft)] bg-[var(--surface-card)] hover:border-[var(--border-strong)]"
                }`}
              >
                <input
                  type="radio"
                  name="storyMode"
                  value={item.value}
                  checked={isActive}
                  onChange={() => setMode(item.value)}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold text-[var(--text-main)]">
                  {item.title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--text-soft)]">
                  {item.description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Что произошло или о чем рассказать
          <span className="ml-2 font-normal text-[var(--text-muted)]">необязательно</span>
        </span>
        <textarea
          name="situation"
          rows={3}
          placeholder={
            mode === "situation"
              ? "Например: сегодня поссорился с другом"
              : "Оставьте пустым, и мы сами придумаем сюжет"
          }
          className={fieldClassName}
        />
      </label>

      <button
        type="button"
        onClick={() => setShowDetails((value) => !value)}
        className="text-sm font-medium text-[var(--logo-text)] hover:text-[var(--text-main)]"
        aria-expanded={showDetails}
      >
        {showDetails ? "Скрыть настройки" : "Дополнительные настройки"}
      </button>

      {showDetails ? (
        <div className="grid gap-5 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-5 md:grid-cols-2">
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
              Дополнительные персонажи
            </span>
            <input
              name="additionalCharacters"
              type="text"
              placeholder="Мама, папа, друг или игрушка"
              className={fieldClassName}
            />
          </label>
        </div>
      ) : null}

      {state.error ? (
        <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[var(--button-dark)] px-4 py-4 text-base font-semibold text-[var(--button-dark-text)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Создаем сказку..." : "Создать сказку"}
      </button>

      {isPending ? (
        <div
          className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] px-4 py-3"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-4 text-sm text-[var(--text-soft)]">
            <span>История создается</span>
            <span>Обычно это занимает несколько секунд</span>
          </div>
          <div className="story-loading mt-3">
            <div className="story-loading__bar" />
          </div>
        </div>
      ) : null}
    </form>
  );
}
