"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type SeriesLibraryItem = {
  childName: string;
  episodesCount: number;
  id: string;
  title: string;
  updatedAt: string;
};

type SeriesLibraryProps = {
  items: SeriesLibraryItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short"
  }).format(new Date(value));
}

export function SeriesLibrary({ items }: SeriesLibraryProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");

    return items.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.title.toLocaleLowerCase("ru-RU").includes(normalizedQuery) ||
        item.childName.toLocaleLowerCase("ru-RU").includes(normalizedQuery);
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && item.episodesCount > 0) ||
        (filter === "empty" && item.episodesCount === 0);

      return matchesQuery && matchesFilter;
    });
  }, [filter, items, query]);

  return (
    <>
      <div className="library-toolbar">
        <label className="library-search">
          <span className="sr-only">Поиск сериалов</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск"
          />
        </label>

        <label className="library-filter">
          <span className="sr-only">Фильтр сериалов</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">Все</option>
            <option value="active">С сериями</option>
            <option value="empty">Без серий</option>
          </select>
        </label>
      </div>

      {visibleItems.length > 0 ? (
        <div className="library-grid">
          {visibleItems.map((item, index) => (
            <article key={item.id} className="library-card">
              <Link href={`/series/${item.id}`} className={`library-card__cover library-card__cover--${index % 4}`}>
                <span>MS</span>
              </Link>

              <div className="library-card__content">
                <div className="library-card__topline">
                  <span>{item.childName}</span>
                  <details className="library-card__menu">
                    <summary aria-label={`Действия: ${item.title}`}>•••</summary>
                    <div>
                      <Link href={`/series/${item.id}`}>Открыть</Link>
                      <Link href={`/series/${item.id}`}>Новая серия</Link>
                    </div>
                  </details>
                </div>

                <Link href={`/series/${item.id}`} className="library-card__title">
                  {item.title}
                </Link>

                <div className="library-card__meta">
                  <span>{item.episodesCount} серий</span>
                  <span>{formatDate(item.updatedAt)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="account-empty-state">
          <p>{items.length === 0 ? "Сериалов пока нет" : "Ничего не найдено"}</p>
          {items.length === 0 ? <Link href="/series/new">Создать сериал</Link> : null}
        </div>
      )}
    </>
  );
}
