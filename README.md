# PhotoTools

PhotoTools is a Next.js image utility app with three workflows:

- Background remover with upload, processing, and result workspace
- Image resize/format converter
- YandexART-ready AI image generator

The app uses a dark visual system based on Tailwind CSS tokens in `src/app/globals.css`, local assets in `public/`, and persistent processing history with PostgreSQL + Prisma.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma + PostgreSQL
- Better Auth
- Sharp for image processing
- PhotoRoom API for background removal (with local sharp fallback)
- Motion for reveal animations
- React Hook Form + Zod
- React Toastify
- Lucide React icons
- Vitest

## Getting Started

Install dependencies:

```bash
npm install
```

Sync the database schema:

```bash
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run dev` runs `predev` first, which frees port `3000` before starting Next.js.

## Scripts

```bash
npm run dev          # Start Next.js dev server on port 3000 with webpack
npm run build        # Production build with webpack
npm run start        # Start production server
npm run lint         # ESLint
npm run test         # All Vitest tests
npm run test:backend # Backend tests only
npm run test:frontend # Frontend tests only
```

## Environment

The project uses the existing `.env` file. Do not commit secrets.

Required:

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
```

YandexART / Yandex AI:

```env
YANDEX_GPT_API=
YANDEX_ID=
YANDEX_GPT_MODEL=
```

Optional Yandex Metrica:

```env
NEXT_PUBLIC_YANDEX_METRIKA_ID=
```

Email verification and password reset through Resend:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

Background removal through PhotoRoom (optional):

```env
PHOTOROOM_REMOVE_BG_API=
```

If YandexART is unavailable or not configured, the generator falls back to the local PhotoTools image. If `PHOTOROOM_REMOVE_BG_API` is not set, `/api/bg-remove` falls back to a local sharp pipeline (no true segmentation).

## Routes

- `/` - Landing page
- `/background-remover` - Background remover upload, processing, and result workflow
- `/converter` - Image resize/format converter
- `/ai-generator` - Prompt-based image generation and latest gallery
- `/login` - Sign in
- `/register` - Sign up
- `/verify-email` - Email verification code confirmation
- `/reset-password/verify` - Password reset code confirmation
- `/reset-password/new` - New password form
- `/profile` - Protected user profile

API routes:

- `/api/bg-remove`
- `/api/convert`
- `/api/generate`
- `/api/auth/[...all]`
- `/api/email-verification/send`
- `/api/email-verification/confirm`
- `/api/password-reset/send`
- `/api/password-reset/verify`
- `/api/password-reset/complete`
- `/api/processed-images/claim`

See [`Backend_Api.md`](Backend_Api.md) for request bodies, response shapes, auth requirements, and current backend behavior.

## Database

Prisma schema is in `prisma/schema.prisma`.

The app stores processing history in `ProcessedImage`:

- `type` - `bg_remove`, `convert`, or `ai_gen`
- `prompt` - AI prompt when relevant
- `fileName` - uploaded file name when relevant
- `resultUrl` - public output URL
- `userId` - linked user when authenticated
- `anonymousOwnerId` - temporary owner id for anonymous AI generations
- `createdAt` - creation timestamp

Better Auth also creates and uses these tables:

- `user`
- `session`
- `account`
- `verification`

Generated files are saved under:

```text
public/generated/
```

Demo assets for the background remover preview are stored under:

```text
public/demo/
```

## Language Detection

The app chooses the initial UI language in this order:

1. User selection saved in `localStorage` and `ui-language`
2. Server/CDN country headers via `src/proxy.ts`
3. Browser locale and timezone fallback

Country headers supported:

- `x-vercel-ip-country`
- `cf-ipcountry`
- `x-country`
- `cloudfront-viewer-country`

`RU` maps to Russian. Other known countries map to EU/English.

App cookies:

- `cookie-consent`
- `ui-language`
- `geo-language`
- `anonymous-owner`

Legacy `phototools-*` cookies are read only for migration and then deleted.

## Design Notes

- Main visual asset: `public/phototools-app.png`
- Background remover demo assets: `public/demo/`
- Favicon: `src/app/favicon.ico`
- Theme tokens: `src/app/globals.css`
- Icons: `lucide-react`
- No hardcoded UI colors outside theme tokens unless there is a specific reason.

## Tests

Tests live only under `tests/`:

- `tests/backend/`
- `tests/frontend/`

Run:

```bash
npm run test
```
