# PostgreSQL SkazKIDS

Порядок применения миграций:

1. `001_create_tables.sql` — прикладные таблицы.
2. `002_create_functions_and_triggers.sql` — ограничения, триггеры и функции.
3. `003_create_auth_tables.sql` — таблицы email-авторизации.
4. `004_create_analytics_tables.sql` — обезличенные AI-события, snapshots и alert state.

Приложение подключается ролью `skazkids_app`. Владельцем объектов остаётся
`skazkids_owner`. PostgreSQL слушает только `127.0.0.1:5432`.

Пользовательские данные и авторизация хранятся в этой базе на VPS.

После четвёртой миграции создайте отдельную минимально привилегированную роль
Analytics Service. Пароль передаётся `psql` и не сохраняется в Git:

```bash
sudo -u postgres psql --dbname=skazkids \
  --set=analytics_password='ЗНАЧЕНИЕ_ИЗ_SECRET_STORE' \
  --file=postgres/setup-analytics-role.sql
```

Строка подключения роли `skazkids_analytics` хранится во внешнем environment-файле.
