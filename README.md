# PhotoTools

Единое рабочее пространство для изображений: уберите фон в один клик, поменяйте размер и формат без потери качества и создайте новые визуалы по текстовому описанию. Всё в браузере — без установки, без сложных настроек, без ожидания.

Внутри — быстрая асинхронная обработка через очередь, надёжное облачное хранилище и честный fallback на каждом шаге: инструмент продолжает работать, даже если внешний сервис недоступен.

## Стек

| Слой              | Технология                                           |
| ----------------- | ---------------------------------------------------- |
| Runtime           | Next.js 16 (App Router, React 19, React Compiler)    |
| Язык              | TypeScript (strict)                                  |
| Стили             | Tailwind CSS 4                                       |
| БД                | PostgreSQL + Prisma 6                                |
| Аутентификация    | Better Auth (email + пароль, сессии)                 |
| Очередь / кэш     | BullMQ + Redis (ioredis)                             |
| Изображения       | sharp; удаление фона — fallback sharp                |
| AI-генерация      | YandexART                                            |
| Хранилище         | AWS S3 / Yandex Object Storage, fallback — `public/` |
| Письма            | Resend (одноразовые коды)                            |
| i18n              | next-intl (en, ru)                                   |
| Тесты             | Vitest                                               |
| Пакетный менеджер | Yarn 1                                               |

## Требования

- Node.js 20+
- PostgreSQL
- Redis — опционально; без него задачи выполняются синхронно (inline), rate limiting падает на in-memory.

## Быстрый старт

```bash
yarn install
cp .env.example .env          # заполнить значения
yarn prisma generate
yarn prisma db push           # применить схему к БД
yarn dev                      # http://localhost:3000
```

Для асинхронной обработки (если задан `REDIS_URL`) отдельно запустить воркер:

```bash
yarn worker:image
```

## Переменные окружения

Полный список с комментариями — в [`.env.example`](.env.example). Обязательные проверяются при старте сервера ([`src/lib/env.ts`](src/lib/env.ts)); в продакшене отсутствие валит запуск.

| Переменная                            | Обяз. | Назначение                                              |
| ------------------------------------- | ----- | ------------------------------------------------------- |
| `DATABASE_URL`                        | да    | Подключение к PostgreSQL                                |
| `BETTER_AUTH_SECRET`                  | да    | Секрет auth и хеширования одноразовых кодов (32+ симв.) |
| `BETTER_AUTH_URL`                     | нет   | Публичный URL приложения                                |
| `NEXT_PUBLIC_SITE_URL`                | нет   | Канонический origin для SEO (metadata/sitemap/robots)   |
| `REDIS_URL`                           | нет   | Очередь задач и распределённый rate limiting            |
| `S3_*`, `STORAGE_PUBLIC_BASE_URL`     | нет   | Хранилище S3; без них файлы пишутся в `public/`         |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | нет   | Отправка кодов подтверждения/сброса                     |
| `YANDEX_GPT_API`, `YANDEX_ID`         | нет   | AI-генерация; без них генерация отключена               |
| `PHOTOROOM_REMOVE_BG_API`             | нет   | Удаление фона; без него — локальный fallback            |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID`       | нет   | Аналитика Yandex Metrika                                |

## Скрипты

| Скрипт                                     | Действие                            |
| ------------------------------------------ | ----------------------------------- |
| `yarn dev`                                 | Dev-сервер на порту 3000            |
| `yarn build`                               | Production-сборка                   |
| `yarn start`                               | Запуск production-сборки            |
| `yarn worker:image`                        | BullMQ-воркер обработки изображений |
| `yarn typecheck`                           | Проверка типов (`tsc --noEmit`)     |
| `yarn lint`                                | ESLint                              |
| `yarn test`                                | Все тесты (Vitest)                  |
| `yarn test:backend` / `yarn test:frontend` | Тесты по слоям                      |
| `yarn format`                              | Prettier                            |

## Архитектура

- **Маршруты** сгруппированы по инструментам: `src/app/(background-remover)`, `(converter)`, `(ai-generator)`, `(auth)`. Route-специфичные компоненты/хуки лежат в `_components/`, `_hooks/` внутри группы.
- **API** — route handlers в `src/app/api/*`. Обработка изображений идёт через задачи (`ProcessingJob`): роут создаёт задачу и, если есть Redis, отдаёт `202` + `jobId`; клиент опрашивает `GET /api/jobs/[id]` до завершения. Без Redis задача выполняется inline.
- **Воркер** — `src/workers/image-worker.ts` разбирает очередь и вызывает `src/lib/image-processors.ts` (sharp / PhotoRoom / YandexART).
- **Хранилище** — `src/lib/storage.ts` абстрагирует S3 и локальную ФС.
- **i18n** — тексты в `messages/en.json` и `messages/ru.json`, локаль определяется в `src/i18n/request.ts` (cookie → гео → `Accept-Language`). Гео-язык проставляет `src/proxy.ts`.

> `src/proxy.ts` — это middleware проекта (переименовано в Next 16). Не добавляйте `middleware.ts` — совместное существование ломает сборку.

Детальная справка по API (эндпоинты, тела запросов, коды ответов, `curl`) — в [`Backend_Api.md`](Backend_Api.md). Работа с БД и Prisma — в [`PrismaInfo.md`](PrismaInfo.md).

## Безопасность

- Валидация обязательных env при старте, fail-fast.
- Загрузки: проверка типа/размера (≤ 10 МБ), ранний отказ по `Content-Length`, проверка размеров изображения через sharp.
- Rate limiting per-user/IP (`src/setting/settings.ts`). Для инструментов бюджет тратится только при успехе; на `send`/`confirm`-эндпоинтах — строгие лимиты против перебора.
- Доступ к статусу задачи (`/api/jobs/[id]`) — только владельцу.
- Заголовки безопасности в [`next.config.ts`](next.config.ts): HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, а также CSP в режиме `Report-Only`.

## SEO

`metadataBase`, OpenGraph/Twitter и канонические URL заданы в корневом layout и per-page (`generateMetadata`). Есть `sitemap.ts`, `robots.ts`, `manifest.ts`.

## Тестирование

```bash
yarn test
```
