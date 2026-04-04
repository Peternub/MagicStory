"use client";

import { useActionState } from "react";
import type { ChildRecord } from "@/lib/types/database";

type StoryActionState = {
  error?: string;
};

type StoryFormProps = {
  action: (
    state: StoryActionState,
    formData: FormData
  ) => Promise<StoryActionState>;
  childrenItems: ChildRecord[];
};

const initialState: StoryActionState = {};

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-[#0f091a] px-4 py-3 text-base text-white placeholder:text-white/35 caret-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20";

export function StoryForm({ action, childrenItems }: StoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Ребенок
        </span>
        <select
          name="childId"
          required
          className={fieldClassName}
          defaultValue=""
        >
          <option value="" disabled>
            Выберите профиль
          </option>
          {childrenItems.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}, {child.age} лет
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Режим сюжета
          </span>
          <select name="mode" defaultValue="guided" className={fieldClassName}>
            <option value="guided">Я задам ситуацию дня</option>
            <option value="auto">Пусть сервис сам придумает сюжет</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
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
        <span className="mb-2 block text-sm font-medium text-white">
          Ситуация дня
        </span>
        <textarea
          name="situation"
          rows={4}
          placeholder="Например: поссорился с другом на площадке, а потом не хотел мириться"
          className={fieldClassName}
        />
        <p className="mt-2 text-xs text-white/45">
          Если выберете автоматический режим, сервис сам придумает сюжет и это
          поле можно оставить пустым.
        </p>
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Место действия
          </span>
          <input
            name="setting"
            type="text"
            required
            placeholder="Лесной домик, морское дно, космический поезд"
            className={fieldClassName}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Главная цель сказки
          </span>
          <select name="goal" defaultValue="спокойное засыпание" className={fieldClassName}>
            <option value="спокойное засыпание">Спокойное засыпание</option>
            <option value="смелость и уверенность">Смелость и уверенность</option>
            <option value="доброта и дружба">Доброта и дружба</option>
            <option value="порядок и ответственность">
              Порядок и ответственность
            </option>
            <option value="самостоятельность">Самостоятельность</option>
            <option value="хорошее настроение">Хорошее настроение</option>
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Настроение сказки
          </span>
          <select name="tone" defaultValue="очень спокойная" className={fieldClassName}>
            <option value="очень спокойная">Очень спокойная</option>
            <option value="уютная">Уютная</option>
            <option value="приключенческая">Приключенческая</option>
            <option value="смешная и добрая">Смешная и добрая</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white">
            Дополнительные персонажи
          </span>
          <input
            name="characters"
            type="text"
            placeholder="Любимая игрушка Аркадий, говорящий кот, подводный капитан"
            className={fieldClassName}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white">
          Дополнительные пожелания
        </span>
        <textarea
          name="extraWishes"
          rows={4}
          placeholder="Например: сделать сказку особенно мягкой перед сном и обязательно добавить сцену примирения"
          className={fieldClassName}
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-brand-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Создаем сказку..." : "Создать сказку"}
      </button>
    </form>
  );
}
