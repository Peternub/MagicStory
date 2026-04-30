import Link from "next/link";
import { deleteChild } from "@/app/actions/children";
import type { ChildRecord } from "@/lib/types/database";

type ChildrenListProps = {
  childrenItems: ChildRecord[];
};

function formatGenderLabel(gender: ChildRecord["gender"]) {
  return gender === "girl" ? "Девочка" : "Мальчик";
}

export function ChildrenList({ childrenItems }: ChildrenListProps) {
  if (childrenItems.length === 0) {
    return (
      <div
        className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-8 text-center"
        style={{ boxShadow: "var(--glow-shadow)" }}
      >
        <p className="text-lg font-medium text-[var(--text-main)]">
          Пока нет ни одного профиля ребенка
        </p>
        <p className="mt-3 text-sm text-[var(--text-soft)]">
          Добавьте первый профиль, чтобы затем быстро выбирать ребенка при создании сказки.
        </p>
        <Link
          href="/children/new"
          className="mt-6 inline-flex rounded-lg bg-[var(--button-dark)] px-5 py-3 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90"
        >
          Добавить ребенка
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {childrenItems.map((child) => (
        <article
          key={child.id}
          className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface-card)] p-6"
          style={{ boxShadow: "var(--glow-shadow)" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-main)]">{child.name}</h2>
              <p className="mt-2 text-sm text-[var(--text-soft)]">Возраст: {child.age}</p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                Пол: {formatGenderLabel(child.gender)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/children/${child.id}`}
                className="rounded-lg border border-[var(--border-strong)] px-4 py-2 text-sm text-[var(--text-main)] transition hover:bg-[var(--surface-card-alt)]"
              >
                Изменить
              </Link>

              <form action={deleteChild}>
                <input type="hidden" name="childId" value={child.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-red-400/25 px-4 py-2 text-sm text-red-200 transition hover:border-red-300/50 hover:bg-red-500/10"
                >
                  Удалить
                </button>
              </form>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
