"use client";

import Link from "next/link";
import { useActionState } from "react";

type AuthActionState = {
  error?: string;
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
};

const initialState: AuthActionState = {};

export function AuthForm({
  action,
  title,
  description,
  submitLabel,
  alternateHref,
  alternateLabel,
  alternateText
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-brand-200/70 bg-white/85 p-8 shadow-glow backdrop-blur">
      <div>
        <h1 className="text-3xl font-semibold text-brand-900">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-brand-900/70">
          {description}
        </p>
      </div>

      <form action={formAction} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-brand-900">Email</span>
          <input
            className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 outline-none transition focus:border-brand-400"
            type="email"
            name="email"
            placeholder="parent@example.ru"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-brand-900">Пароль</span>
          <input
            className="w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 outline-none transition focus:border-brand-400"
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

        <button
          className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Подождите..." : submitLabel}
        </button>
      </form>

      <p className="mt-6 text-sm text-brand-900/70">
        {alternateText}{" "}
        <Link className="font-medium text-brand-700" href={alternateHref}>
          {alternateLabel}
        </Link>
      </p>
    </div>
  );
}
