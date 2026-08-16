# PostgreSQL SkazKIDS

Порядок применения миграций:

1. `001_create_tables.sql` — прикладные таблицы.
2. `002_create_functions_and_triggers.sql` — ограничения, триггеры и функции.
3. `003_create_auth_tables.sql` — таблицы email-авторизации.

Приложение подключается ролью `skazkids_app`. Владельцем объектов остаётся
`skazkids_owner`. PostgreSQL слушает только `127.0.0.1:5432`.

Пользовательские данные и авторизация хранятся в этой базе на VPS.
