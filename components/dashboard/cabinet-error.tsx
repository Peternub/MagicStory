"use client";

type CabinetErrorProps = {
  reset: () => void;
};

export function CabinetError({ reset }: CabinetErrorProps) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-10 sm:px-8">
      <section className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-[var(--text-main)]">Не удалось загрузить данные</h1>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-[var(--button-dark)] px-5 py-3 text-sm font-semibold text-[var(--button-dark-text)]"
        >
          Попробовать ещё раз
        </button>
      </section>
    </main>
  );
}
