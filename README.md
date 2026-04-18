# Магические Сказки

MVP на `Next.js` для сервиса генерации персональных сказок без озвучки.

## Что уже подготовлено

- базовая структура `App Router`;
- конфиги `TypeScript` и `Tailwind CSS`;
- стартовые маркетинговые и кабинетные страницы;
- шаблоны `.env.example` и `.env.local.example`;
- серверная генерация сказок;
- базовые миграции и `RLS` для Supabase.

## Настройка Supabase

1. Создайте файл `.env.local` на основе [.env.local.example](c:\Users\HUAWEI\Documents\Мои проекты VIBECODE\MagicStory\.env.local.example).
2. Подставьте значения:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
3. Если используете локальный Supabase CLI, конфиг уже лежит в [supabase/config.toml](c:\Users\HUAWEI\Documents\Мои проекты VIBECODE\MagicStory\supabase\config.toml).
4. Примените SQL-миграции из [supabase/migrations/20260403_001_init_magic_story.sql](c:\Users\HUAWEI\Documents\Мои проекты VIBECODE\MagicStory\supabase\migrations\20260403_001_init_magic_story.sql).
5. Если база уже запускалась со старой схемой, примените [supabase/migrations/20260418_004_remove_audio_support.sql](c:\Users\HUAWEI\Documents\Мои проекты VIBECODE\MagicStory\supabase\migrations\20260418_004_remove_audio_support.sql).

## Что уже закрыто по Supabase

- таблицы `profiles`, `children`, `stories`, `usage_events`;
- триггер автосоздания `profiles` после регистрации;
- `RLS` для основных таблиц;
- server client и admin client для server-side интеграций.

## Что дальше

- довести новую главную страницу и тарифную сетку;
- подключить боевую модель генерации текста;
- внедрить фактическое списание лимитов и оплату.
