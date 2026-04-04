"use client";

import Link from "next/link";
import { useActionState } from "react";

type AuthActionState = {
  error?: string;
  success?: string;
};

type AuthFormProps = {
  action: (
    state: AuthActionState,
    formData: FormData
  ) => Promise<AuthActionState>;
  title: string;
  description: string;
  submitLabel: string;
  alternateHref: string;
  alternateLabel: string;
  alternateText: string;
  showNameFields?: boolean;
};

const initialState: AuthActionState = {};

const inputClassName =
  "w-full rounded-2xl border border-brand-200 bg-white px-5 py-4 text-lg text-brand-950 outline-none transition placeholder:text-brand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-200/50";

export function AuthForm({
  action,
  title,
  description,
  submitLabel,
  alternateHref,
  alternateLabel,
  alternateText,
  showNameFields = false
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <div className="w-full max-w-3xl rounded-[2.5rem] border border-brand-200/70 bg-white/90 p-8 shadow-glow backdrop-blur sm:p-10">
      <div>
        <h1 className="text-4xl font-semibold text-brand-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-brand-900/65">
          {description}
        </p>
      </div>

      <form action={formAction} className="mt-10 space-y-5">
        {showNameFields ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-3 block text-base font-medium text-brand-950">
                Имя
              </span>
              <input
                className={inputClassName}
                type="text"
                name="firstName"
                placeholder="Анна"
                required
              />
            </label>

            <label className="block">
              <span className="mb-3 block text-base font-medium text-brand-950">
                Фамилия
              </span>
              <input
                className={inputClassName}
                type="text"
                name="lastName"
                placeholder="Иванова"
                required
              />
            </label>
          </div>
        ) : null}

        <label className="block">
          <span className="mb-3 block text-base font-medium text-brand-950">
            Email
          </span>
          <input
            className={inputClassName}
            type="email"
            name="email"
            placeholder="parent@example.ru"
            required
          />
        </label>

        <label className="block">
          <span className="mb-3 block text-base font-medium text-brand-950">
            Пароль
          </span>
          <input
            className={inputClassName}
            type="password"
            name="password"
            placeholder="Минимум 8 символов"
            required
            minLength={8}
          />
        </label>

        {state.error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {state.success}
          </p>
        ) : null}

        <button
          className="w-full rounded-2xl bg-brand-700 px-4 py-4 text-lg font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Подождите..." : submitLabel}
        </button>
      </form>

      <p className="mt-8 text-base text-brand-900/70">
        {alternateText}{" "}
        <Link className="font-semibold text-brand-700" href={alternateHref}>
          {alternateLabel}
        </Link>
      </p>
    </div>
  );
}
