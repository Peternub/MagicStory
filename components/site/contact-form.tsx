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
      className="rounded-lg border border-[#efd9d2] bg-white p-8 shadow-glow"
    >
      <div className="grid gap-4">
        <label className="block">
          <span className="mb-2 block text-sm text-[#5b6477]">Имя</span>
          <input
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-[#ead7d0] bg-[#fff9f7] px-4 py-3 text-[#24324c] outline-none transition focus:border-[#b78397]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-[#5b6477]">Как с вами связаться</span>
          <input
            name="contact"
            type="text"
            required
            className="w-full rounded-lg border border-[#ead7d0] bg-[#fff9f7] px-4 py-3 text-[#24324c] outline-none transition focus:border-[#b78397]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-[#5b6477]">Сообщение</span>
          <textarea
            name="message"
            rows={6}
            required
            className="w-full rounded-lg border border-[#ead7d0] bg-[#fff9f7] px-4 py-3 text-[#24324c] outline-none transition focus:border-[#b78397]"
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
        className="mt-6 w-full rounded-lg bg-[#24324c] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1b2740] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Отправляем..." : "Отправить"}
      </button>
    </form>
  );
}
