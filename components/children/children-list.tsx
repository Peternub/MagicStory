import Link from "next/link";
import { deleteChild } from "@/app/actions/children";
import type { ChildRecord } from "@/lib/types/database";

type ChildrenListProps = {
  childrenItems: ChildRecord[];
};

function formatAge(age: number) {
  const lastTwo = age % 100;
  const last = age % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return `${age} лет`;
  if (last === 1) return `${age} год`;
  if (last >= 2 && last <= 4) return `${age} года`;
  return `${age} лет`;
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "MS";
}

export function ChildrenList({ childrenItems }: ChildrenListProps) {
  if (childrenItems.length === 0) {
    return (
      <div className="account-empty-state">
        <p>Профилей пока нет</p>
        <Link href="/children/new">Добавить ребёнка</Link>
      </div>
    );
  }

  return (
    <div className="profiles-grid">
      {childrenItems.map((child) => (
        <article key={child.id} className="profile-card">
          <div className="profile-card__avatar" aria-hidden="true">
            {getInitial(child.name)}
          </div>

          <div className="profile-card__content">
            <h2>{child.name}</h2>
            <p>{formatAge(child.age)}</p>
          </div>

          <div className="profile-card__actions">
            <Link href={`/children/${child.id}`}>Открыть</Link>

            <details className="profile-card__menu">
              <summary aria-label={`Действия: ${child.name}`}>•••</summary>
              <div>
                <Link href={`/children/${child.id}`}>Редактировать</Link>
                <form action={deleteChild}>
                  <input type="hidden" name="childId" value={child.id} />
                  <button type="submit">Удалить</button>
                </form>
              </div>
            </details>
          </div>
        </article>
      ))}
    </div>
  );
}
