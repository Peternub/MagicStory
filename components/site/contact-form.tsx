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
      className="rounded-[2rem] border border-white/10 bg-[#160a27] p-8 backdrop-blur"
    >
      <div className="grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm text-white/75">Имя</span>
          <input
            name="name"
            type="text"
            required
            className="w-full rounded-2xl border border-white/10 bg-[#0e0b18] px-4 py-3 text-white outline-none transition focus:border-brand-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-white/75">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-white/10 bg-[#0e0b18] px-4 py-3 text-white outline-none transition focus:border-brand-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-white/75">Сообщение</span>
          <textarea
            name="message"
            rows={6}
            required
            className="w-full rounded-2xl border border-white/10 bg-[#0e0b18] px-4 py-3 text-white outline-none transition focus:border-brand-400"
          />
        </label>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="mt-4 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Отправляем..." : "Отправить сообщение"}
      </button>
    </form>
  );
}
