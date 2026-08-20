# SkazKIDS Analytics Bot MVP

## Реализовано

- Ежедневный отчёт current/previous/baseline с timezone `Europe/Moscow`.
- Нормализованный объект метрик без персональных данных.
- Детерминированный Rule Engine с защитой от маленькой выборки.
- Structured AI-анализ через существующий AI Gateway.
- Fallback-отчёт без AI при любой ошибке анализа.
- Telegram-команды `/today` и `/status`.
- Строгий whitelist `TELEGRAM_ALLOWED_CHAT_IDS`; остальные chat ID игнорируются.
- Технические health checks PostgreSQL, backend, AI Gateway, backup, disk, RAM, load, systemd и Nginx.
- Критические alerts, два последовательных отказа для сетевых компонентов, cooldown и recovery message.
- Ограниченный retry Telegram delivery.
- Ежедневные обезличенные snapshots и состояние alerts в PostgreSQL.
- Неизменяемые события AI-запросов: результат, latency, tokens, model, provider, стоимость и категория ошибки.
- Централизованный `AI_PRICING_CONFIG`; неизвестная цена остаётся `null`, а не ложным нулём.

## Источники данных

| Метрика | Источник |
|---|---|
| Регистрации | `public.user.createdAt` Better Auth |
| Активные пользователи | `usage_events: series_episode_created` |
| Профили детей | `children.created_at` |
| Сериалы | `story_series.created_at` |
| Эпизоды | `stories.created_at` |
| Успешные генерации | `usage_events: series_episode_created` |
| AI-запросы, ошибки, latency, tokens, cost | `analytics_generation_events` |
| Первый сериал | первый `story_series.created_at` пользователя |
| Продолжение сериала | `stories.episode_number >= 2` |
| Episode continuation proxy | успешные episode 1 и episode 2 |
| Next-day return proxy | пересечение активных пользователей соседних 24-часовых окон |
| Оплаты | существующие `payments`, `subscriptions`, `starter_offer_orders`; раздел отчёта скрыт до активации billing |

Подробные ограничения исходной схемы описаны в [аудите данных](analytics-data-audit.md).

## Метрики отчёта

- новые и активные пользователи;
- previous и 7-дневный baseline, изменения в процентах;
- созданные профили детей, сериалы и эпизоды;
- успешные и неуспешные генерации;
- впервые создавшие и продолжившие сериал;
- эпизоды на активного пользователя;
- episode continuation и next-day return proxy;
- AI requests/success/failure/error rate;
- avg и p95 latency;
- input/output tokens, configured cost;
- provider/model и top error categories;
- краткий статус инфраструктуры.

## Недостающие данные

Пока нельзя достоверно рассчитать:

- открытие и чтение серии;
- полный DAU вне создания эпизодов;
- HTTP 5xx и backend error categories за период;
- исторические failed generation до миграции AI-событий;
- retry rate внутри AI Gateway;
- retention D1/D3/D7 и cohorts.

Для них нужны продуктовые события просмотра и структурированный журнал HTTP/backend ошибок. Значения не подменяются нулями: отчёт показывает `н/д` или `insufficient_data`.

## Telegram

- `/today` — формирует текущий отчёт вручную.
- `/status` — показывает Backend, Database, AI, Backup и Disk.
- Неизвестные команды и chat ID игнорируются.
- Команды read-only и не могут выполнять SQL, shell или менять production.

## Alerts

Уведомления создаются кодом, без решения LLM:

- `BACKEND_DOWN` — два последовательных отказа;
- `DATABASE_DOWN` — два последовательных отказа;
- `PRODUCTION_SERVICE_DOWN` — два последовательных отказа;
- `AI_GATEWAY_DOWN` — два последовательных отказа;
- `BACKUP_EXPIRED` — старше критического порога;
- `DISK_CRITICAL` — выше критического порога;
- `AI_ERROR_RATE_CRITICAL` — больше 10% минимум при 10 запросах.

Открытый incident повторяется не чаще `ANALYTICS_ALERT_COOLDOWN_MINUTES`. После восстановления отправляется длительность incident.

## AI

Модели отправляются только:

- агрегированные product metrics;
- агрегированное health state;
- результаты Rule Engine;
- технические коды недоступных секций.

Email, имена пользователей и детей, тексты сказок, UUID, session ID, токены, ключи и сырые логи не отправляются. Перед отправкой пакет дополнительно проверяется на email, UUID и названия secret-полей. Ответ модели валидируется строгой JSON schema. Ошибка AI не отменяет отчёт.

## Secrets

Secrets находятся вне Git:

- `/etc/skazkids/analytics.env` — `ANALYTICS_DATABASE_URL`, Telegram token и whitelist;
- `/etc/skazkids/ai-gateway.env` — общий secret gateway;
- `/etc/skazkids/app.env` — `AI_PRICING_CONFIG` для учёта product AI cost.

Файлы должны принадлежать `root:skazkids-analytics` или соответствующему сервисному group и иметь mode `0640` или строже. Значения secrets нельзя копировать в журнал или Git.

## PostgreSQL

Применить миграции `004` и `005`, затем создать отдельную роль:

```bash
sudo -u postgres psql --dbname=skazkids --file=postgres/migrations/004_create_analytics_tables.sql
sudo -u postgres psql --dbname=skazkids --file=postgres/migrations/005_allow_unknown_ai_cost.sql
sudo -u postgres psql --dbname=skazkids \
  --set=analytics_password='ЗНАЧЕНИЕ_ИЗ_SECRET_STORE' \
  --file=postgres/setup-analytics-role.sql
```

Роль `skazkids_analytics` читает только необходимые production-таблицы и пишет только snapshots/alert state. Основное приложение записывает AI event только через ограниченную `security definer` функцию.

## systemd

Созданы units:

- `skazkids-analytics-bot.service`;
- `skazkids-analytics-report.service`;
- `skazkids-analytics-report.timer`;
- `skazkids-analytics-alerts.service`;
- `skazkids-analytics-alerts.timer`.

Установка:

```bash
sudo useradd --system --home /nonexistent --shell /usr/sbin/nologin skazkids-analytics
sudo install -o root -g skazkids-analytics -m 0640 deploy/analytics.env.example /etc/skazkids/analytics.env
sudo install -o root -g root -m 0644 deploy/skazkids-analytics-*.service /etc/systemd/system/
sudo install -o root -g root -m 0644 deploy/skazkids-analytics-*.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now skazkids-analytics-bot.service
sudo systemctl enable --now skazkids-analytics-report.timer
sudo systemctl enable --now skazkids-analytics-alerts.timer
```

Шаблон environment нужно заполнить реальными secrets до запуска. Пользователю `skazkids-analytics` нужен read-only Unix-доступ к каталогу backup. Не выдавать ему членство в `postgres`, sudo или доступ на запись в `/opt/skazkids`.

Время отчёта задаётся конфигурацией systemd timer. По умолчанию — 10:00 `Europe/Moscow`. Изменение без правки кода:

```bash
sudo systemctl edit skazkids-analytics-report.timer
```

```ini
[Timer]
OnCalendar=
OnCalendar=*-*-* 09:30:00 Europe/Moscow
```

## Проверка на VPS

```bash
sudo -u skazkids-analytics /usr/local/bin/bun run analytics:status
sudo -u skazkids-analytics /usr/local/bin/bun run analytics:report
sudo -u skazkids-analytics /usr/local/bin/bun run analytics:alerts
systemctl list-timers 'skazkids-analytics-*'
journalctl -u skazkids-analytics-report.service -n 50 --no-pager
```

Обязательный production smoke test после заполнения secrets:

1. daily report доставлен;
2. `/today` и `/status` отвечают владельцу;
3. неизвестный chat ID не получает ответ;
4. `ANALYTICS_AI_ENABLED=false` не ломает отчёт;
5. временно неверный Telegram endpoint приводит к ограниченному retry;
6. искусственно старый test backup вызывает alert;
7. повторный alert подавляется;
8. восстановление вызывает recovery message;
9. отказ одной SQL-метрики оставляет остальные секции;
10. snapshot не содержит персональных данных.

Локально проверяются unit-тесты, TypeScript и production build. Production delivery нельзя подтвердить без доступа к VPS, production PostgreSQL и созданному через BotFather боту.

## Security

- PostgreSQL слушает только localhost.
- Analytics использует отдельную роль с минимальными правами.
- Telegram whitelist обязателен.
- AI получает только агрегаты.
- Нет unrestricted SQL, shell-команд и destructive actions.
- systemd units работают без root, с read-only filesystem и hardening.
- Логи содержат технический status, execution time и report ID, но не secrets и production dataset.

## Что осталось

- применить миграции и units на production VPS;
- создать отдельного бота через BotFather и заполнить secrets;
- выполнить production smoke test выше;
- добавить `series_opened`/`episode_opened` для полного DAU;
- добавить структурированные backend/HTTP 5xx events;
- после накопления данных уточнить цены моделей в `AI_PRICING_CONFIG`.

Full Version, web-admin, arbitrary SQL и управляющие production-команды не реализуются в рамках MVP.
