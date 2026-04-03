# Магические Сказки

Стартовый каркас MVP на `Next.js` для сервиса генерации персональных сказок с аудио.

## Что уже подготовлено

- базовая структура `App Router`;
- конфиги `TypeScript` и `Tailwind CSS`;
- стартовая главная страница;
- шаблон `.env.example`;
- базовый модуль валидации переменных окружения.

## Настройка Supabase

1. Создайте файл `.env.local` на основе [.env.local.example](c:\Users\HUAWEI\Documents\Мои проекты VIBECODE\MagicStory\.env.local.example).
2. Подставьте значения:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Если используете локальный Supabase CLI, конфиг уже лежит в [supabase/config.toml](c:\Users\HUAWEI\Documents\Мои проекты VIBECODE\MagicStory\supabase\config.toml).
4. Примените SQL-миграции из [supabase/migrations/20260403_001_init_magic_story.sql](c:\Users\HUAWEI\Documents\Мои проекты VIBECODE\MagicStory\supabase\migrations\20260403_001_init_magic_story.sql).

## Что еще нужно вручную в Supabase

- включить `Email/Password` в `Auth`;
- создать bucket для аудио, например `story-audio`;
- проверить `RLS` и политики после применения миграции;
- при необходимости добавить production URL в redirect settings.

## Следующий шаг в коде

Подключение реального `LLM` и `TTS` вместо временного генератора текста.
