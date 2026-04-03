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
5. Примените миграцию storage из [supabase/migrations/20260403_002_storage_story_audio.sql](c:\Users\HUAWEI\Documents\Мои проекты VIBECODE\MagicStory\supabase\migrations\20260403_002_storage_story_audio.sql).

## Что еще нужно вручную в Supabase

- включить `Email/Password` в `Auth`;
- проверить `RLS` и политики после применения миграции;
- при необходимости добавить production URL в redirect settings.

## Что уже закрыто по Supabase

- таблицы `profiles`, `children`, `stories`, `usage_events`;
- триггер автосоздания `profiles` после регистрации;
- `RLS` для основных таблиц;
- приватный bucket `story-audio`;
- политики доступа к `Storage` по префиксу `user_id/...`;
- server client и admin client для дальнейших server-side интеграций.

## Следующий шаг в коде

Подключение реального `LLM` и `TTS` вместо временного генератора текста.
