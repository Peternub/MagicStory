"use client";

import { useActionState } from "react";

type StoryActionState = {
  error?: string;
};

type StoryFormProps = {
  action: (
    state: StoryActionState,
    formData: FormData
  ) => Promise<StoryActionState>;
};

const initialState: StoryActionState = {};

const fieldClassName =
  "w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface-secondary)] px-4 py-3 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)] caret-[var(--text-main)] outline-none transition focus:border-[var(--border-strong)] focus:ring-4 focus:ring-[var(--accent-gold-soft)]";

export function StoryForm({ action }: StoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Имя ребенка
          </span>
          <input
            name="childName"
            type="text"
            required
            placeholder="Петя"
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Возраст
          </span>
          <input
            name="childAge"
            type="number"
            min={3}
            max={12}
            required
            placeholder="6"
            className={fieldClassName}
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Интересы ребенка
          </span>
          <input
            name="childInterests"
            type="text"
            placeholder="Космос, машинки, подводный мир"
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Страхи или переживания
          </span>
          <input
            name="childFears"
            type="text"
            placeholder="Темнота, громкие звуки"
            className={fieldClassName}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Дополнительный контекст о ребенке
        </span>
        <textarea
          name="childContext"
          rows={3}
          placeholder="Любимая игрушка, важное событие дня, друзья, особенности характера"
          className={fieldClassName}
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Режим сюжета
          </span>
          <select name="mode" defaultValue="guided" className={fieldClassName}>
            <option value="guided">Я задам ситуацию дня</option>
            <option value="auto">Пусть сервис сам придумает сюжет</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Длительность сказки
          </span>
          <select
            name="durationMinutes"
            defaultValue="5"
            className={fieldClassName}
          >
            <option value="3">3 минуты</option>
            <option value="5">5 минут</option>
            <option value="7">7 минут</option>
            <option value="10">10 минут</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Ситуация дня
        </span>
        <textarea
          name="situation"
          rows={4}
          placeholder="Например: поссорился с другом и не хотел мириться"
          className={fieldClassName}
        />
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Если выберете автоматический режим, это поле можно оставить пустым.
        </p>
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Место действия
          </span>
          <input
            name="setting"
            type="text"
            required
            placeholder="Лесной домик, садик, морской берег"
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Главная цель сказки
          </span>
          <select
            name="goal"
            defaultValue="спокойное засыпание"
            className={fieldClassName}
          >
            <option value="спокойное засыпание">Спокойное засыпание</option>
            <option value="смелость и уверенность">Смелость и уверенность</option>
            <option value="доброта и дружба">Доброта и дружба</option>
            <option value="порядок и ответственность">Порядок и ответственность</option>
            <option value="самостоятельность">Самостоятельность</option>
            <option value="хорошее настроение">Хорошее настроение</option>
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Настроение сказки
          </span>
          <select
            name="tone"
            defaultValue="очень спокойная"
            className={fieldClassName}
          >
            <option value="очень спокойная">Очень спокойная</option>
            <option value="уютная">Уютная</option>
            <option value="приключенческая">Приключенческая</option>
            <option value="смешная и добрая">Смешная и добрая</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
            Роль ребенка в сказке
          </span>
          <select
            name="childRole"
            defaultValue="главный герой"
            className={fieldClassName}
          >
            <option value="главный герой">Главный герой</option>
            <option value="один из главных героев">Один из главных героев</option>
            <option value="второстепенный герой">Второстепенный герой</option>
            <option value="вообще не участвует в сюжете">
              Вообще не участвует в сюжете
            </option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Дополнительные персонажи
        </span>
        <input
          name="characters"
          type="text"
          placeholder="Мама, лучший друг, говорящий кот"
          className={fieldClassName}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--text-main)]">
          Дополнительные пожелания
        </span>
        <textarea
          name="extraWishes"
          rows={4}
          placeholder="Сделать сказку особенно мягкой перед сном и добавить добрый финал"
          className={fieldClassName}
        />
      </label>

      {state.error ? (
        <p className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[var(--button-dark)] px-4 py-3 text-sm font-medium text-[var(--button-dark-text)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Создаем сказку..." : "Создать сказку"}
      </button>
    </form>
  );
}
