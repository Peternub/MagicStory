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
  "w-full rounded-2xl border border-white/10 bg-[#0f091a] px-5 py-4 text-lg text-white placeholder:text-white/35 caret-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20";

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
    <div className="w-full max-w-3xl rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(21,11,35,0.96),rgba(40,17,74,0.9))] p-8 shadow-glow backdrop-blur sm:p-10">
      <div>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
          {description}
        </p>
      </div>

      <form action={formAction} className="mt-10 space-y-5">
        {showNameFields ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-3 block text-base font-medium text-white">
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
              <span className="mb-3 block text-base font-medium text-white">
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
          <span className="mb-3 block text-base font-medium text-white">
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
          <span className="mb-3 block text-base font-medium text-white">
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
          <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
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

      <p className="mt-8 text-base text-white/70">
        {alternateText}{" "}
        <Link className="font-semibold text-brand-200" href={alternateHref}>
          {alternateLabel}
        </Link>
      </p>
    </div>
  );
}
