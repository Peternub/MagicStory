"use client";

import { useActionState } from "react";
import {
  requestStarterOffer,
  type StarterOfferActionState
} from "@/app/actions/starter-offer";

const initialState: StarterOfferActionState = {};

export function StarterOfferButton() {
  const [state, action, isPending] = useActionState(requestStarterOffer, initialState);

  return (
    <div>
      <form action={action}>
        <button type="submit" disabled={isPending} className="house-primary-button w-full disabled:opacity-60">
          {isPending ? "Создаём заявку…" : "Оформить за 39 ₽"}
        </button>
      </form>
      {state.error ? <p className="mt-3 text-sm text-red-300">{state.error}</p> : null}
      {state.message ? <p className="mt-3 text-sm text-[var(--text-soft)]">{state.message}</p> : null}
    </div>
  );
}
