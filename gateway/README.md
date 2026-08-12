# AI Gateway SkazKIDS

Минимальный stateless-сервис между московским backend и OpenAI.

## Сетевой контур

- приложение слушает только `127.0.0.1:3100`;
- Nginx принимает HTTPS на `443` только от `201.34.140.220`;
- UFW повторно ограничивает `443` тем же московским IP;
- запросы требуют отдельный Bearer-секрет;
- PostgreSQL и постоянное хранилище отсутствуют.

## Секреты

`/etc/skazkids-ai-gateway/secrets.env`, владелец `root:skazgateway`, права `0640`:

```dotenv
GATEWAY_SHARED_SECRET=
OPENAI_API_KEY=
```

Обычная конфигурация хранится отдельно в `/etc/skazkids-ai-gateway/gateway.env`.
Полные prompt и response не записываются в журнал.
