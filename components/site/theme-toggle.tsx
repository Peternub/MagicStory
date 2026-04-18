"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

const STORAGE_KEY = "magicstory-theme";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const nextTheme: ThemeMode = stored === "light" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    setReady(true);
  }, []);

  function handleChange(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  return (
    <div
      className="flex items-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface-soft)] p-1"
      aria-label="Переключатель темы"
    >
      <button
        type="button"
        onClick={() => handleChange("dark")}
        className={`rounded-md px-3 py-1.5 text-sm transition ${
          ready && theme === "dark"
            ? "bg-[var(--button-dark)] text-[var(--button-dark-text)]"
            : "text-[var(--logo-text)] opacity-90"
        }`}
      >
        Тёмная
      </button>
      <button
        type="button"
        onClick={() => handleChange("light")}
        className={`rounded-md px-3 py-1.5 text-sm transition ${
          ready && theme === "light"
            ? "bg-[var(--button-light)] text-[var(--button-light-text)]"
            : "text-[var(--logo-text)] opacity-90"
        }`}
      >
        Светлая
      </button>
    </div>
  );
}
