import Link from "next/link";
import { deleteChild } from "@/app/actions/children";
import type { ChildRecord } from "@/lib/types/database";

type ChildrenListProps = {
  childrenItems: ChildRecord[];
};

function formatGenderLabel(gender?: ChildRecord["gender"]) {
  if (gender === "girl") {
    return "Девочка";
  }

  if (gender === "boy") {
    return "Мальчик";
  }

  return "Не указан";
}

function formatAge(age: number) {
  const lastTwo = age % 100;
  const last = age % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return `${age} лет`;
  }

  if (last === 1) {
    return `${age} год`;
  }

  if (last >= 2 && last <= 4) {
    return `${age} года`;
  }

  return `${age} лет`;
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "MS";
}

export function ChildrenList({ childrenItems }: ChildrenListProps) {
  if (childrenItems.length === 0) {
    return (
      <div className="house-panel family-empty">
        <div className="family-empty__frame" aria-hidden="true">
          <span>+</span>
        </div>
        <p>Семейная галерея ждёт первую фотографию</p>
        <h2>Добавьте профиль ребёнка</h2>
        <div>Данные профиля помогут создавать персональные сериалы и серии.</div>
        <Link
          href="/children/new"
          className="house-primary-button"
        >
          Добавить ребёнка
        </Link>
      </div>
    );
  }

  return (
    <div className="family-gallery-grid">
      {childrenItems.map((child, index) => (
        <article key={child.id} className={`house-panel family-profile family-profile--${index % 3}`}>
          <div className="family-profile__portrait">
            <div className="family-profile__avatar" aria-hidden="true">
              <span>{getInitial(child.name)}</span>
            </div>
            <span>{formatGenderLabel(child.gender)}</span>
          </div>

          <div className="family-profile__details">
            <div className="family-profile__title">
              <div>
                <p>Профиль ребёнка</p>
                <h2>{child.name}</h2>
              </div>
              <span>{formatAge(child.age)}</span>
            </div>

            <dl className="family-profile__facts">
              <div>
                <dt>Интересы</dt>
                <dd>{child.interests || "Пока не указаны"}</dd>
              </div>
              <div>
                <dt>Друзья и близкие</dt>
                <dd>{child.additional_context || "Пока не указаны"}</dd>
              </div>
              {child.fears ? (
                <div>
                  <dt>Что важно учитывать</dt>
                  <dd>{child.fears}</dd>
                </div>
              ) : null}
            </dl>

            <div className="family-profile__actions">
              <Link
                href={`/children/${child.id}`}
                className="house-primary-button"
              >
                Открыть профиль
              </Link>

              <form action={deleteChild}>
                <input type="hidden" name="childId" value={child.id} />
                <button
                  type="submit"
                  className="family-profile__delete"
                >
                  Удалить
                </button>
              </form>
            </div>
          </div>
        </article>
      ))}

      <Link href="/children/new" className="family-add-frame">
        <span aria-hidden="true">+</span>
        <strong>Добавить ребёнка</strong>
        <small>Создать новый профиль</small>
      </Link>
    </div>
  );
}
