"use client";

import { useActionState } from "react";
import { sendContactRequest } from "@/app/actions/contact";

type ContactActionState = {
  error?: string;
  success?: string;
};

const initialState: ContactActionState = {};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    sendContactRequest,
    initialState
  );

  return (
    <form
      action={formAction}
      className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-8"
      style={{ boxShadow: "var(--glow-shadow)" }}
    >
      <div className="grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm text-[var(--text-soft)]">Имя</span>
          <input
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-[var(--text-main)] outline-none transition focus:border-[var(--border-strong)]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-[var(--text-soft)]">
            Как с вами связаться
          </span>
          <input
            name="contact"
            type="text"
            required
            className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-[var(--text-main)] outline-none transition focus:border-[var(--border-strong)]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-[var(--text-soft)]">Сообщение</span>
          <textarea
            name="message"
            rows={6}
            required
            className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] px-4 py-3 text-[var(--text-main)] outline-none transition focus:border-[var(--border-strong)]"
          />
        </label>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full rounded-lg bg-[var(--button-dark)] px-4 py-3 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Отправляем..." : "Отправить"}
      </button>
    </form>
  );
}
