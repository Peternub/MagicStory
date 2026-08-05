export function CabinetLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Загружаем личный кабинет"
      className="mx-auto min-h-screen w-full max-w-5xl animate-pulse px-4 py-6 sm:px-8 sm:py-10"
    >
      <div className="h-3 w-32 rounded bg-[var(--surface-soft)]" />
      <div className="mt-4 h-9 w-64 max-w-full rounded bg-[var(--surface-secondary)]" />
      <div className="mt-8 h-48 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)]" />
      <div className="mt-4 h-52 rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)]" />
      <div className="mt-4 grid gap-1 sm:grid-cols-3">
        <div className="h-28 rounded-lg bg-[var(--surface-card)]" />
        <div className="h-28 rounded-lg bg-[var(--surface-card)]" />
        <div className="h-28 rounded-lg bg-[var(--surface-card)]" />
      </div>
    </main>
  );
}
