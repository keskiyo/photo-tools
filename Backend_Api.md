# PhotoTools — Backend API Reference

Полная справка по backend-слою PhotoTools: эндпоинты, форматы запросов, успешные и ошибочные ответы, коды статусов и примеры `curl`. Документ отражает текущее состояние кода.

- **Base URL (локально):** `http://localhost:3000`
- **Формат:** JSON или `multipart/form-data` (указано для каждого эндпоинта).
- **Инструменты и служебные эндпоинты — `POST`**; `GET` только у `/api/auth/get-session`, `/api/jobs/[id]` (статус задачи) и `/api/health`. POST-эндпоинт по ссылке в браузере открыть нельзя — будет `405`.
- **Обработка изображений асинхронная.** Роут создаёт задачу (`ProcessingJob`) и при наличии Redis отвечает `202` с `jobId`; клиент опрашивает `GET /api/jobs/[id]` до статуса `completed`/`failed`. Без Redis задача выполняется inline и результат возвращается сразу.

## Содержание

- [Технологии](#технологии)
- [Переменные окружения](#переменные-окружения)
- [Общие соглашения](#общие-соглашения)
- [Cookies](#cookies)
- [Rate limiting](#rate-limiting)
- [Аутентификация (Better Auth)](#аутентификация-better-auth)
  - [POST /api/auth/sign-up/email](#post-apiauthsign-upemail)
  - [POST /api/auth/sign-in/email](#post-apiauthsign-inemail)
  - [GET /api/auth/get-session](#get-apiauthget-session)
- [Подтверждение email](#подтверждение-email)
  - [POST /api/email-verification/send](#post-apiemail-verificationsend)
  - [POST /api/email-verification/confirm](#post-apiemail-verificationconfirm)
- [Восстановление пароля](#восстановление-пароля)
  - [POST /api/password-reset/send](#post-apipassword-resetsend)
  - [POST /api/password-reset/verify](#post-apipassword-resetverify)
  - [POST /api/password-reset/complete](#post-apipassword-resetcomplete)
- [Привязка анонимных генераций](#привязка-анонимных-генераций)
  - [POST /api/processed-images/claim](#post-apiprocessed-imagesclaim)
- [Инструменты обработки](#инструменты-обработки)
  - [POST /api/generate](#post-apigenerate)
  - [POST /api/convert](#post-apiconvert)
  - [POST /api/bg-remove](#post-apibg-remove)
- [Статус задачи](#статус-задачи)
  - [GET /api/jobs/[id]](#get-apijobsid)
- [Healthcheck](#healthcheck)
  - [GET /api/health](#get-apihealth)
- [Модель данных](#модель-данных)
- [Тестирование](#тестирование)

---

## Технологии

| Слой                  | Технология                                         |
| --------------------- | -------------------------------------------------- |
| Runtime               | Next.js 16 App Router (route handlers)             |
| База данных           | PostgreSQL через Prisma                            |
| Аутентификация        | Better Auth (email + пароль, сессии)               |
| Очередь задач         | BullMQ + Redis (ioredis); без Redis — inline       |
| Хранилище             | AWS S3 / Yandex Object Storage; fallback `public/` |
| Письма                | Resend (одноразовые коды)                          |
| Обработка изображений | sharp                                              |
| Удаление фона         | PhotoRoom API (+ локальный fallback на sharp)      |
| AI-генерация          | YandexART                                          |

## Переменные окружения

Полный шаблон с комментариями — в [`.env.example`](.env.example). Обязательные переменные проверяются при старте сервера ([`src/lib/env.ts`](src/lib/env.ts) через [`src/instrumentation.ts`](src/instrumentation.ts)); в production их отсутствие валит запуск.

```env
# Обязательные
DATABASE_URL=
BETTER_AUTH_SECRET=          # 32+ символа: секрет auth и хеширования одноразовых кодов
BETTER_AUTH_URL=http://localhost:3000

# SEO
NEXT_PUBLIC_SITE_URL=        # опц., публичная; канонический origin для metadata/sitemap/robots

# Очередь и rate limiting (Redis)
REDIS_URL=                   # опц.; без него задачи выполняются inline, лимиты — in-memory
IMAGE_WORKER_CONCURRENCY=3   # опц., параллелизм воркера

# Хранилище (S3 / Yandex Object Storage)
S3_BUCKET=                   # опц.; без него файлы пишутся в public/
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=                 # опц. (Yandex/MinIO)
S3_FORCE_PATH_STYLE=         # опц.
STORAGE_PUBLIC_BASE_URL=     # публичная база URL для отдачи файлов

# Письма (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=           # опц., fallback: "PhotoTools <onboarding@resend.dev>"

# AI-генерация (YandexART)
YANDEX_GPT_API=
YANDEX_ID=
YANDEX_GPT_MODEL=            # опц., fallback: art://${YANDEX_ID}/yandex-art/latest

# Удаление фона (PhotoRoom)
PHOTOROOM_REMOVE_BG_API=     # опц.; без него /api/bg-remove использует локальный fallback

# Аналитика
NEXT_PUBLIC_YANDEX_METRIKA_ID=  # опц., публичная
```

Все ключи — серверные, кроме `NEXT_PUBLIC_*`. Изменения `.env` подхватываются при перезапуске сервера.

## Общие соглашения

**Ошибка** — единый JSON во всех кастомных эндпоинтах:

```json
{ "error": "Human-readable or machine reason" }
```

**Успех инструментов обработки** (`generate` / `convert` / `bg-remove`) зависит от наличия Redis:

```jsonc
// С Redis — задача поставлена в очередь (HTTP 202):
{ "jobId": "clx...", "job": { "id": "clx...", "type": "ai_gen", "status": "queued", "progress": 0, "resultUrl": null, "error": null, "createdAt": "...", "updatedAt": "..." } }

// Без Redis — задача выполнена inline (HTTP 200):
{ "jobId": "clx...", "resultUrl": "/generated/ai_gen-...jpg", "job": { "id": "clx...", "status": "completed", "progress": 100, "resultUrl": "/generated/ai_gen-...jpg", "...": "..." } }
```

Клиент опрашивает `GET /api/jobs/[id]` до `status: "completed"` (тогда доступен `resultUrl`) или `"failed"`. `resultUrl` — публичный путь (S3 или `public/generated/`), открывается в браузере напрямую.

**Успех служебных эндпоинтов** (email / reset / claim): `{ "ok": true }` (у `password-reset/verify` дополнительно `token`).

## Cookies

| Cookie            | Назначение                                                                              |
| ----------------- | --------------------------------------------------------------------------------------- |
| `cookie-consent`  | выбор пользователя в cookie-баннере                                                     |
| `ui-language`     | ручной выбор языка                                                                      |
| `geo-language`    | язык по country-заголовкам CDN (ставит `src/proxy.ts`)                                  |
| `anonymous-owner` | `httpOnly` id для привязки результатов, сделанных до входа (ставят все три инструмента) |

Better Auth ставит свои session-cookies (`better-auth.session_token` или `__Secure-`-вариант). Legacy-cookies `phototools-*` читаются только для миграции и удаляются при следующих запросах.

## Rate limiting

Лимиты заданы в [`src/setting/settings.ts`](src/setting/settings.ts):

| Параметр                          | Назначение                       |
| --------------------------------- | -------------------------------- |
| `requestLimits.aiGeneration`      | успешные AI-генерации            |
| `requestLimits.backgroundRemoval` | успешные удаления фона           |
| `requestLimits.resize`            | успешные конвертации/ресайзы     |
| `requestLimitWindowMs`            | окно отсчёта (текущее — 24 часа) |

Сейчас значения — `9999` на 24 часа (практически без блокировок; **снизить перед публичным запуском**). Ключ лимита: id пользователя (если вошёл) иначе IP. Счётчик тратится на каждый запрос инструмента (проверка выполняется в начале роута, до создания задачи). При превышении — `429`. Хранилище счётчиков — Redis, при отсутствии `REDIS_URL` — in-memory.

`send`-эндпоинты (email/reset) имеют отдельные лимиты: **5 на email** и **20 на IP** за 15 минут. Эндпоинты проверки/подтверждения кода и сброса (`email-verification/confirm`, `password-reset/verify`, `password-reset/complete`) тротлятся **~10 попыток на email и на IP за 15 минут** (защита от перебора кода/токена) — при превышении `429`.

---

## Аутентификация (Better Auth)

Маршрут `/api/auth/[...all]` целиком обслуживает Better Auth. Сессия — 30 дней (`expiresIn`), обновление — раз в день (`updateAge`). Ниже — ключевые эндпоинты, используемые фронтендом.

### POST /api/auth/sign-up/email

Регистрация по email и паролю. Телефона/соцсетей нет.

**Тело** (`application/json`):

| Поле       | Тип    | Требования                           |
| ---------- | ------ | ------------------------------------ |
| `name`     | string | мин. 2 символа (валидируется формой) |
| `email`    | string | валидный email                       |
| `password` | string | мин. 8 символов                      |

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Maks","email":"maks@example.com","password":"password123"}'
```

После успешной регистрации фронтенд вызывает `/api/processed-images/claim`, затем `/api/email-verification/send`. Новому пользователю нужно подтвердить email кодом.

### POST /api/auth/sign-in/email

**Тело** (`application/json`):

| Поле         | Тип     | Требования      |
| ------------ | ------- | --------------- |
| `email`      | string  | валидный email  |
| `password`   | string  | мин. 8 символов |
| `rememberMe` | boolean | опц.            |

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"maks@example.com","password":"password123","rememberMe":true}'
```

После входа фронтенд вызывает `/api/processed-images/claim`, чтобы привязать анонимные генерации.

### GET /api/auth/get-session

Возвращает текущую сессию (или `null`), читая session-cookie. Используется на клиенте и сервере.

```bash
curl http://localhost:3000/api/auth/get-session -H "Cookie: better-auth.session_token=..."
```

---

## Подтверждение email

### POST /api/email-verification/send

Отправляет 6-значный код подтверждения email через Resend.

**Тело** (`application/json`):

| Поле    | Тип    | Требования     |
| ------- | ------ | -------------- |
| `email` | string | валидный email |

**Поведение:** если пользователя нет или email уже подтверждён — ничего не раскрывает и всё равно отвечает `{ "ok": true }`. Код живёт 15 минут, хранится в таблице `verification` только как hash, старый код удаляется перед новым.

| Код   | Когда                                        | Тело                                                        |
| ----- | -------------------------------------------- | ----------------------------------------------------------- |
| `200` | принято                                      | `{ "ok": true }`                                            |
| `400` | невалидный email                             | `{ "error": "Invalid email." }`                             |
| `429` | превышен лимит (5/email или 20/IP за 15 мин) | `{ "error": "Too many requests. Please try again later." }` |
| `500` | сбой отправки письма                         | `{ "error": "Failed to send verification code." }`          |

```bash
curl -X POST http://localhost:3000/api/email-verification/send \
  -H "Content-Type: application/json" \
  -d '{"email":"maks@example.com"}'
```

### POST /api/email-verification/confirm

Подтверждает email по коду. После 5 неверных попыток код блокируется.

**Тело** (`application/json`):

| Поле    | Тип    | Требования               |
| ------- | ------ | ------------------------ |
| `email` | string | валидный email           |
| `code`  | string | ровно 6 цифр (`^\d{6}$`) |

| Код   | Когда                                                   | Тело                                                                                  |
| ----- | ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `200` | email подтверждён                                       | `{ "ok": true }`                                                                      |
| `400` | невалидное тело                                         | `{ "error": "Invalid verification code." }`                                           |
| `400` | код не подошёл / истёк / не найден                      | `{ "error": "invalid" }` · `{ "error": "expired" }` · `{ "error": "not_found" }`      |
| `429` | код заблокирован (5 попыток) или превышен лимит попыток | `{ "error": "locked" }` · `{ "error": "Too many requests. Please try again later." }` |

```bash
curl -X POST http://localhost:3000/api/email-verification/confirm \
  -H "Content-Type: application/json" \
  -d '{"email":"maks@example.com","code":"123456"}'
```

---

## Восстановление пароля

Трёхшаговый flow: **send → verify → complete**. Все навигации на фронте делаются через `router.replace`, чтобы после завершения нельзя было вернуться к экранам восстановления по кнопке «назад».

### POST /api/password-reset/send

Отправляет 6-значный код сброса пароля.

**Тело** (`application/json`): `{ "email": "maks@example.com" }`

**Поведение:** если аккаунта нет — всё равно `{ "ok": true }` (не раскрываем наличие). Код живёт 15 минут, хранится как hash.

| Код   | Когда            | Тело                                                        |
| ----- | ---------------- | ----------------------------------------------------------- |
| `200` | принято          | `{ "ok": true }`                                            |
| `400` | невалидный email | `{ "error": "Invalid email." }`                             |
| `429` | превышен лимит   | `{ "error": "Too many requests. Please try again later." }` |
| `500` | сбой отправки    | `{ "error": "Failed to send reset code." }`                 |

```bash
curl -X POST http://localhost:3000/api/password-reset/send \
  -H "Content-Type: application/json" \
  -d '{"email":"maks@example.com"}'
```

### POST /api/password-reset/verify

Проверяет код и выдаёт одноразовый reset-token (живёт 10 минут).

**Тело** (`application/json`):

| Поле    | Тип    | Требования     |
| ------- | ------ | -------------- |
| `email` | string | валидный email |
| `code`  | string | ровно 6 цифр   |

| Код   | Когда                                               | Тело                                                                                                                           |
| ----- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `200` | код верный                                          | `{ "ok": true, "token": "uuid-token" }`                                                                                        |
| `400` | невалидное тело / неверный / истёк / не найден      | `{ "error": "Invalid verification code." }` · `{ "error": "invalid" }` · `{ "error": "expired" }` · `{ "error": "not_found" }` |
| `429` | заблокирован (5 попыток) или превышен лимит попыток | `{ "error": "locked" }` · `{ "error": "Too many requests. Please try again later." }`                                          |

```bash
curl -X POST http://localhost:3000/api/password-reset/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"maks@example.com","code":"123456"}'
```

### POST /api/password-reset/complete

Меняет пароль (hashing через Better Auth, чтобы вход продолжил работать) и отзывает все сессии пользователя.

**Тело** (`application/json`):

| Поле       | Тип    | Требования                 |
| ---------- | ------ | -------------------------- |
| `email`    | string | валидный email             |
| `token`    | string | reset-token из шага verify |
| `password` | string | мин. 8 символов            |

| Код   | Когда                            | Тело                                                         |
| ----- | -------------------------------- | ------------------------------------------------------------ |
| `200` | пароль изменён                   | `{ "ok": true }`                                             |
| `400` | невалидное тело / неверный token | `{ "error": "Invalid request." }` · `{ "error": "invalid" }` |
| `410` | token истёк                      | `{ "error": "expired" }`                                     |
| `429` | превышен лимит попыток           | `{ "error": "Too many requests. Please try again later." }`  |

```bash
curl -X POST http://localhost:3000/api/password-reset/complete \
  -H "Content-Type: application/json" \
  -d '{"email":"maks@example.com","token":"uuid-token","password":"newpassword123"}'
```

---

## Привязка анонимных генераций

### POST /api/processed-images/claim

Привязывает AI-генерации, сделанные анонимно (по cookie `anonymous-owner`), к вошедшему пользователю. Вызывается фронтендом после регистрации/входа.

**Требования:** активная сессия Better Auth (через cookie). Тело не нужно.

| Код   | Когда                              | Тело                          |
| ----- | ---------------------------------- | ----------------------------- |
| `200` | привязано, либо привязывать нечего | `{ "ok": true }`              |
| `401` | нет сессии                         | `{ "error": "Unauthorized" }` |

После успеха cookies `anonymous-owner` и legacy `phototools-anonymous-owner` удаляются.

```bash
curl -X POST http://localhost:3000/api/processed-images/claim \
  -H "Cookie: better-auth.session_token=...; anonymous-owner=..."
```

---

## Инструменты обработки

### POST /api/generate

AI-генерация изображения через YandexART.

**Тело** (`application/json`):

| Поле          | Тип    | Обяз. | Ограничения                                                                                                                                        | По умолчанию |
| ------------- | ------ | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `prompt`      | string | да    | 8–1000 символов после trim                                                                                                                         | —            |
| `style`       | string | нет   | `none`, `product`, `cinematic`, `editorial`, `minimal`, `portrait`, `anime`, `watercolor`, `render3d`, `vintage`, `cyberpunk`, `fantasy`, `popart` | `none`       |
| `aspectRatio` | string | нет   | `1:1`, `16:9`, `9:16`, `4:3`                                                                                                                       | `1:1`        |

| Код   | Когда                                                          | Тело                                                                          |
| ----- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `202` | задача поставлена в очередь (есть Redis)                       | `{ "jobId", "job" }` (см. «Общие соглашения»)                                 |
| `200` | задача выполнена inline (нет Redis)                            | `{ "jobId", "resultUrl", "job" }`                                             |
| `400` | невалидное тело (короткий prompt / неизвестный style / aspect) | `{ "error": "Provide a prompt of at least 8 characters and a valid style." }` |
| `429` | превышен лимит                                                 | `{ "error": "Too many generations. Please try again later." }`                |
| `500` | внутренняя ошибка                                              | `{ "error": "Could not generate image." }`                                    |

> В production, если AI недоступен или не вернул картинку, задача завершается со статусом `failed` (виден через `/api/jobs/[id]`), а не ошибкой самого запроса. В development отдаётся fallback `/phototools-app.png`.

**Поведение:**

- В development без ключей Yandex результат подменяется на `/phototools-app.png`. В production, если генерация недоступна, задача завершается статусом `failed` (виден через `/api/jobs/[id]`).
- Для вошедшего пользователя задача/результат сохраняются с `userId`. Для анонима ставится `httpOnly` cookie `anonymous-owner` (30 дней) и запись сохраняется с `anonymousOwnerId` — позже привязывается через `/api/processed-images/claim`. То же поведение у `/api/convert` и `/api/bg-remove`.
- Каждый prompt логируется (см. `src/lib/prompt-log.ts`).

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"neon cat in the rain","style":"cyberpunk","aspectRatio":"16:9"}'
```

### POST /api/convert

Конвертация формата и ресайз изображения через sharp.

**Поля** (`multipart/form-data`):

| Поле                  | Тип    | Обяз. | Ограничения                              | По умолчанию  |
| --------------------- | ------ | ----- | ---------------------------------------- | ------------- |
| `file`                | File   | да    | PNG/JPEG/WebP, > 0 и ≤ 10 МБ             | —             |
| `format`              | string | нет   | `jpeg`, `png`, `webp`                    | `webp`        |
| `width`               | number | нет   | целое > 0                                | без изменения |
| `height`              | number | нет   | целое > 0                                | без изменения |
| `quality`             | number | нет   | 1–100                                    | `85`          |
| `preserveAspectRatio` | string | нет   | строка `false` отключает; иначе включено | `true`        |

| Код   | Когда                                      | Тело                                                           |
| ----- | ------------------------------------------ | -------------------------------------------------------------- |
| `202` | задача в очереди (есть Redis)              | `{ "jobId", "job" }`                                           |
| `200` | задача выполнена inline (нет Redis)        | `{ "jobId", "resultUrl", "job" }`                              |
| `400` | нет файла / неверный тип / размер          | `{ "error": "Upload a PNG, JPEG, or WebP image under 10MB." }` |
| `413` | тело превышает лимит (по `Content-Length`) | `{ "error": "Upload a PNG, JPEG, or WebP image under 10MB." }` |
| `429` | превышен лимит                             | `{ "error": "Too many requests. Please try again later." }`    |
| `500` | внутренняя ошибка                          | `{ "error": "Could not convert image." }`                      |

```bash
curl -X POST http://localhost:3000/api/convert \
  -F "file=@C:/path/to/image.png" \
  -F "format=webp" -F "width=800" -F "preserveAspectRatio=true"
```

### POST /api/bg-remove

Удаление фона. Основной движок — **PhotoRoom API** (высокое качество, прозрачный PNG). Если `PHOTOROOM_REMOVE_BG_API` не задан или вызов упал — используется **локальный fallback на sharp** (без реальной сегментации, изображение нормализуется на прозрачный холст). Результат всегда PNG.

**Поля** (`multipart/form-data`):

| Поле   | Тип  | Обяз. | Ограничения                  |
| ------ | ---- | ----- | ---------------------------- |
| `file` | File | да    | PNG/JPEG/WebP, > 0 и ≤ 10 МБ |

| Код   | Когда                                      | Тело                                                           |
| ----- | ------------------------------------------ | -------------------------------------------------------------- |
| `202` | задача в очереди (есть Redis)              | `{ "jobId", "job" }`                                           |
| `200` | задача выполнена inline (нет Redis)        | `{ "jobId", "resultUrl", "job" }`                              |
| `400` | нет файла / неверный тип / размер          | `{ "error": "Upload a PNG, JPEG, or WebP image under 10MB." }` |
| `413` | тело превышает лимит (по `Content-Length`) | `{ "error": "Upload a PNG, JPEG, or WebP image under 10MB." }` |
| `429` | превышен лимит                             | `{ "error": "Too many requests. Please try again later." }`    |
| `500` | внутренняя ошибка                          | `{ "error": "Could not process background removal." }`         |

```bash
curl -X POST http://localhost:3000/api/bg-remove \
  -F "file=@C:/path/to/image.png"
```

---

## Статус задачи

### GET /api/jobs/[id]

Возвращает статус задачи обработки. Клиент опрашивает эндпоинт после `202`, пока `status` не станет `completed` (тогда доступен `resultUrl`) или `failed`.

**Доступ:** только владелец задачи — вошедший пользователь (по `userId`) или аноним (по cookie `anonymous-owner`). Чужая/несуществующая задача → `404` (существование чужих задач не раскрывается).

| Код   | Когда                     | Тело                                                                                                        |
| ----- | ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `200` | задача найдена и она твоя | сериализованная задача (`id`, `type`, `status`, `progress`, `resultUrl`, `error`, `createdAt`, `updatedAt`) |
| `404` | не найдена или не твоя    | `{ "error": "Processing job not found." }`                                                                  |

```bash
curl http://localhost:3000/api/jobs/clx... \
  -H "Cookie: anonymous-owner=..."
```

Статусы задачи: `queued` → `processing` → `completed` | `failed` | `cancelled`.

---

## Healthcheck

### GET /api/health

Liveness/readiness-проба. Проверяет доступность БД. Внутренние детали не раскрываются.

| Код   | Когда         | Тело                                                                                         |
| ----- | ------------- | -------------------------------------------------------------------------------------------- |
| `200` | БД доступна   | `{ "status": "ok", "database": "up", "redis": "...", "storage": "...", "timestamp": "..." }` |
| `503` | БД недоступна | `{ "status": "degraded", "database": "down", ... }`                                          |

```bash
curl http://localhost:3000/api/health
```

---

## Модель данных

`ProcessedImage` (история обработок):

| Поле               | Тип           | Описание                                                        |
| ------------------ | ------------- | --------------------------------------------------------------- |
| `id`               | string (cuid) | первичный ключ                                                  |
| `type`             | string        | `bg_remove` · `convert` · `ai_gen`                              |
| `prompt`           | string?       | prompt AI-генерации                                             |
| `fileName`         | string?       | имя исходного файла                                             |
| `resultUrl`        | string        | публичный путь результата                                       |
| `userId`           | string?       | владелец-пользователь (relation на `user`, `onDelete: SetNull`) |
| `anonymousOwnerId` | string?       | временный владелец для анонимной генерации                      |
| `createdAt`        | DateTime      | дата создания                                                   |

Индексы: `[type, createdAt]`, `[userId, createdAt]`, `[anonymousOwnerId, createdAt]`.

`ProcessingJob` (асинхронные задачи обработки):

| Поле                      | Тип      | Описание                                                       |
| ------------------------- | -------- | -------------------------------------------------------------- |
| `id`                      | string   | первичный ключ                                                 |
| `type`                    | string   | `bg_remove` · `convert` · `ai_gen`                             |
| `status`                  | string   | `queued` · `processing` · `completed` · `failed` · `cancelled` |
| `progress`                | number   | 0–100                                                          |
| `inputKey`                | string?  | ключ исходного файла в хранилище                               |
| `resultUrl`               | string?  | публичный путь результата (по завершении)                      |
| `error`                   | string?  | текст ошибки (при `failed`)                                    |
| `payload`                 | json     | параметры задачи (валидируется перед обработкой)               |
| `userId`                  | string?  | владелец-пользователь                                          |
| `anonymousOwnerId`        | string?  | анонимный владелец (cookie)                                    |
| `createdAt` / `updatedAt` | DateTime | даты создания/обновления                                       |

`inputKey` и `payload` не отдаются наружу — `serializeProcessingJob` исключает их из ответа.

Таблицы Better Auth: `user`, `session`, `account`, `verification`. Таблица `verification` также используется кастомными кодами подтверждения email и сброса пароля (хранятся как hash).

## Тестирование

**VS Code REST Client** (`humao.rest-client`) — создай `requests.http`:

```http
### AI генерация
POST http://localhost:3000/api/generate
Content-Type: application/json

{ "prompt": "neon cat in the rain", "style": "cyberpunk", "aspectRatio": "16:9" }

### Отправить код сброса пароля
POST http://localhost:3000/api/password-reset/send
Content-Type: application/json

{ "email": "maks@example.com" }
```

Для `multipart` (convert / bg-remove) удобнее **Thunder Client / Postman / Hoppscotch**: тип тела `form-data`, поле `file` как File.

**PowerShell:**

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/generate -Method Post `
  -ContentType application/json `
  -Body '{"prompt":"neon cat in the rain","style":"cyberpunk"}'
```
