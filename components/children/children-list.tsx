import Link from "next/link";
import { deleteChild } from "@/app/actions/children";
import type { ChildRecord } from "@/lib/types/database";

type ChildrenListProps = {
  childrenItems: ChildRecord[];
};

export function ChildrenList({ childrenItems }: ChildrenListProps) {
  if (childrenItems.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-brand-300 bg-white/70 p-8 text-center">
        <p className="text-lg font-medium text-brand-900">
          Пока нет ни одного профиля ребенка
        </p>
        <p className="mt-3 text-sm text-brand-900/70">
          Добавьте первый профиль, чтобы перейти к генерации персональных
          сказок.
        </p>
        <Link
          href="/children/new"
          className="mt-6 inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-medium text-white"
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
          className="rounded-[2rem] border border-brand-200/70 bg-white/85 p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-brand-900">
                {child.name}
              </h2>
              <p className="mt-2 text-sm text-brand-900/70">
                Возраст: {child.age}
              </p>
              {child.interests ? (
                <p className="mt-2 text-sm text-brand-900/70">
                  Интересы: {child.interests}
                </p>
              ) : null}
              {child.fears ? (
                <p className="mt-2 text-sm text-brand-900/70">
                  Страхи: {child.fears}
                </p>
              ) : null}
              {child.additional_context ? (
                <p className="mt-2 text-sm text-brand-900/70">
                  Контекст: {child.additional_context}
                </p>
              ) : null}
            </div>

            <form action={deleteChild}>
              <input type="hidden" name="childId" value={child.id} />
              <button
                type="submit"
                className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700 transition hover:border-red-400"
              >
                Удалить
              </button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
