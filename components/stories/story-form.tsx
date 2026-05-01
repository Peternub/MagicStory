"use client";

import { useEffect, useRef, useState, useActionState } from "react";
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

type SelectOption = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  name: string;
  options: SelectOption[];
  placeholder: string;
  defaultValue?: string;
};

const initialState: StoryActionState = {};

const fieldClassName =
  "w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] px-4 py-3 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)] caret-[var(--text-main)] outline-none transition focus:border-[var(--border-strong)] focus:ring-4 focus:ring-[var(--accent-gold-soft)]";

const durationOptions: SelectOption[] = [
  { value: "3", label: "3 минуты" },
  { value: "5", label: "5 минут" },
  { value: "7", label: "7 минут" }
];

function formatGenderLabel(gender: ChildRecord["gender"]) {
  return gender === "girl" ? "девочка" : "мальчик";
}

function CustomSelect({
  name,
  options,
  placeholder,
  defaultValue = ""
}: CustomSelectProps) {
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`${fieldClassName} flex items-center justify-between gap-4 text-left`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selected ? "" : "text-[var(--text-muted)]"}>
          {selected?.label ?? placeholder}
        </span>
        <span className={`text-[var(--text-muted)] transition ${isOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {isOpen ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-40 overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--surface-primary)] p-2"
          style={{ boxShadow: "var(--glow-shadow)" }}
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setValue(option.value);
                setIsOpen(false);
              }}
              className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition hover:bg-[var(--surface-card-alt)] ${
                option.value === value
                  ? "bg-[var(--accent-gold-soft)] text-[var(--text-main)]"
                  : "text-[var(--text-soft)]"
              }`}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function StoryForm({ action, childrenItems }: StoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const childOptions = childrenItems.map((child) => ({
    value: child.id,
    label: `${child.name}, ${child.age} лет, ${formatGenderLabel(child.gender)}`
  }));

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Для кого сказка
        </span>
        <CustomSelect
          name="childId"
          options={childOptions}
          placeholder="Выберите ребенка"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Тема сказки
        </span>
        <textarea
          name="situation"
          rows={4}
          placeholder="Например: ребенок устал, поссорился с другом или переживает перед садиком"
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
            placeholder="Дом, садик, двор, кухня, прогулка"
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Длительность
          </span>
          <CustomSelect
            name="durationMinutes"
            options={durationOptions}
            placeholder="Выберите длительность"
            defaultValue="5"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Дополнительные персонажи
        </span>
        <input
          name="additionalCharacters"
          type="text"
          placeholder="Например: мама, папа, сестра Аня, друг Миша, любимая игрушка"
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Что должна дать сказка/Мораль
        </span>
        <textarea
          name="goal"
          rows={3}
          placeholder="Например: показать, что ошибаться не страшно, или помочь спокойно уснуть"
          className={fieldClassName}
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Дополнительные пожелания
        </span>
        <input
          name="extraWishes"
          type="text"
          placeholder="Например: сделать сказку смешнее, спокойнее или без волшебства"
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
