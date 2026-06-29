# AGENTS.md

## Purpose and scope

- Instructions for AI coding agents working on Next.js repositories: Codex, Claude Code, Cursor, Copilot agents, and similar tools.
- Apply this file to the whole repository unless a deeper `AGENTS.md` overrides it for a subdirectory.
- Treat the current codebase as the source of truth: read files first, then make the smallest correct change.
- Do not assume this file defines the project stack; always inspect `package.json`, lockfile, configs, and existing imports.
- Prefer maintainable solutions over quick hacks, hidden side effects, or unnecessary abstractions.
- If user instructions conflict with this file, follow the user unless it would break safety, privacy, data integrity, or repository rules.

## First steps for every task

- Read `package.json` before choosing libraries, scripts, state tools, form tools, test tools, or styling tools.
- Read `tsconfig.json` before using aliases, JSX settings, strictness assumptions, or module conventions.
- Read framework configs such as `next.config.*`, `eslint.config.*`, `tailwind.config.*`, `postcss.config.*`, and `components.json` when relevant.
- Locate the nearest existing implementation of the same pattern and copy its style before creating a new pattern.
- Prefer editing existing focused files over adding new files, unless separation clearly improves readability.
- Do not run destructive commands, migrations, deletes, resets, or force operations without explicit user approval.

## Package and stack policy

- `package.json` is the only source of truth for the installed technology stack.
- Use scripts from `package.json` for dev, build, lint, test, format, typecheck, seed, migration, and audit commands.
- Do not add a dependency if the current stack can solve the task cleanly.
- Do not recommend React Hook Form, Zod, TanStack Query, Redux, Zustand, Prisma, Drizzle, Mongoose, shadcn, Radix, Recharts, Framer Motion, or any other library unless it is already installed or the user asks to add it.
- If several libraries are installed for similar work, follow the one already used in the touched feature.
- Preserve the package manager implied by the lockfile: `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, or `bun.lockb`.

## Common commands

- Install dependencies with the repository package manager, usually `npm install`, `pnpm install`, `yarn install`, or `bun install`.
- Start development with the script named `dev` when present.
- Run production verification with `build` when present.
- Run linting with `lint` when present.
- Run tests, typecheck, format, audit, or e2e only if corresponding scripts exist.
- If a command is missing, do not invent it; mention that no script was found.
- If checks cannot be run, explain why and list what the user should run locally.

## Recommended universal structure

- Use this structure as a guide, not a hard requirement; adapt to the existing repository.
- `src/app/` - Next.js App Router pages, layouts, route handlers, route groups, metadata, loading/error/not-found files, and global styles.
- `src/actions/` - server actions and server-side mutations when the project uses them.
- `src/components/` - reusable React UI, layout components, feature components, shared widgets, and SVG components.
- `src/components/ui/` - low-level UI primitives and design-system wrappers.
- `src/components/layout/` - header, footer, navigation, sidebar, breadcrumbs, shell, and page chrome.
- `src/components/shared/` - reusable business-agnostic components such as cards, pagination, filters, dialogs, buttons, and empty states.
- `src/hooks/` - reusable client hooks and feature hooks.
- `src/lib/` - framework helpers, API clients, auth helpers, DB helpers, integration clients, className helpers, and runtime utilities.
- `src/store/` - global state, state providers, slices, stores, API slices, and typed store hooks.
- `src/types/` - shared TypeScript types reused across modules.
- `src/data/` - static app data, lists, mock data, and local dictionaries.
- `src/constants/` - reusable constants and initial form/config values.
- `config/` - project configuration, limits, feature flags, pagination values, business constants, and shared settings.
- `utils/` - cross-cutting helpers such as formatting, validation, SEO, slug generation, image helpers, redirects, and auth utilities.
- `migrations/` - database migrations, migration configs, and seed data if the project has a database.
- `public/` - static assets, images, icons, uploads, manifests, robots, and Open Graph files.
- Keep route-specific components close to their route in `_components/`; move them to shared folders only after reuse is real.
- Project convention: feature routes should use App Router route groups like `src/app/(auth)/login/page.tsx`, `src/app/(ai-generator)/ai-generator/page.tsx`, `src/app/(converter)/converter/page.tsx`, and `src/app/(background-remover)/background-remover/page.tsx`.
- Put route-specific UI, hooks, and types inside that route group's `_components/`, `_hooks/`, and `_types/` folders. For example, auth-only form code belongs in `src/app/(auth)/_components/`, not `src/components/`.
- Keep shared logic that is used by multiple routes in common folders such as `src/components/`, `src/lib/`, `src/hooks/`, or `src/types/`. Do not duplicate shared upload/result/progress UI inside route groups.

## Next.js App Router rules

- Prefer Server Components by default.
- Add `'use client'` only for browser APIs, local state, effects, refs, event handlers, client stores, or client-only libraries.
- Keep `page.tsx` focused on route composition, data boundaries, and metadata wiring.
- Keep `layout.tsx` focused on shell composition, providers, and route-level structure.
- Use `loading.tsx`, `error.tsx`, `not-found.tsx`, and empty states deliberately.
- Use `route.ts` handlers for API endpoints and return clear HTTP statuses.
- Use `next/link`, `next/image`, `next/font`, and metadata APIs where appropriate.
- Do not pass secrets, cookies, DB clients, or non-serializable objects into Client Components.
- Prefer colocated route utilities for one route and shared utilities for repeated logic.

## React component rules

- Keep components focused on one responsibility.
- Extract complex `.map()` items into named child components.
- Avoid deeply nested JSX conditionals; use early returns, small helpers, or smaller components.
- Destructure props in function parameters when it improves readability.
- Keep loading, error, empty, disabled, selected, active, and success states explicit.
- Do not create broad “god components” that mix fetching, transformation, layout, form state, and rendering.
- For reusable components, expose variants through typed props, not copied class blocks.
- Do not convert a Server Component to a Client Component just to fix a small child interaction; isolate the client part.

## TypeScript rules

- Preserve the repository TypeScript strictness; do not weaken `tsconfig` to silence errors.
- Avoid `any`; use domain types, inferred types, `unknown` with narrowing, or local `type Props`.
- Use `import type` for type-only imports.
- Use `PascalCase` for components and types.
- Use `camelCase` for variables, functions, props, and hooks.
- Use `UPPER_CASE` for stable constants when that convention exists in the repository.
- Use `useSomething` for hooks and `useSomethingStore` for Zustand-like stores when applicable.
- Prefer union types for variants, statuses, and sizes.
- Prefer `as const` objects plus derived union types over TypeScript `enum` unless the project already uses enums nearby.
- Follow local conventions such as `I*` or `T*` prefixes only when the surrounding code already uses them.

## Imports and exports

- Use aliases only after confirming them in `tsconfig.json` or project config.
- If `@/*` maps to `src/*`, prefer it for imports across distant folders.
- Prefer relative imports for very close siblings when that is the local style.
- Prefer named exports for components, hooks, utilities, and constants.
- Use default exports where Next.js expects them: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
- Use barrel files only when they improve clarity and do not create circular dependencies or hide ownership.
- Keep import order consistent with nearby files.

## Styling and design system

- Use the styling system already present in the project: Tailwind, CSS Modules, Sass, styled components, vanilla CSS, or a component library.
- If Tailwind is used, prefer a shared `cn()` helper based on the existing implementation.
- Keep conditional class logic readable; extract large class decisions into helpers.
- Use design tokens, CSS variables, semantic classes, or theme values instead of hardcoded colors where the project supports them.
- Respect light/dark theme architecture when present.
- Make layouts responsive from the start: mobile, tablet, desktop, and long-content states.
- Avoid one-off visual hacks that cannot be reused or explained.
- Use icons to clarify meaning, not as decoration that adds noise.

## Accessibility and UX

- Use semantic HTML: `main`, `section`, `article`, `nav`, `button`, `form`, `label`, `table`, `thead`, `tbody`, `th`, and `td` when appropriate.
- Do not replace buttons or links with clickable `div`s.
- Ensure keyboard navigation and visible focus states.
- Add meaningful `alt` text for meaningful images.
- Mark decorative icons with `aria-hidden="true"` or `role="presentation"`.
- Use ARIA only when needed, such as `aria-label`, `aria-expanded`, `aria-disabled`, `aria-live`, and `aria-current`.
- Preserve heading hierarchy and readable page structure.
- Design all important states: loading, empty, error, success, disabled, active, hover, selected, and unauthenticated.
- Keep forms scannable with labels, validation messages, and clear submission feedback.

## Forms and validation

- Use the form and validation tools already installed and used in the target feature.
- Keep validation schemas close to the form when only used once; move them to shared validation utilities when reused.
- Validate on the server even if the client already validates.
- Do not trust query params, request bodies, cookies, localStorage, or hidden form fields.
- Show field-level errors near fields and global errors near submit areas.
- Prevent double submission where it can create duplicate records or payments.

## State and data fetching

- Follow the state tools already used in the repository: React state, Context, Zustand, Redux, RTK Query, SWR, TanStack Query, server actions, or direct server fetching.
- Do not duplicate server state in a client store without a clear reason.
- Keep query keys, cache keys, or slice names stable and descriptive when the project uses them.
- Keep derived calculations in helpers or selectors instead of scattering them through JSX.
- For writes, update or invalidate related cached data intentionally.
- Keep global state minimal; prefer local state for local UI behavior.

## API routes, server actions, and database work

- Keep route handlers and server actions small, typed, and testable.
- Reuse the existing database/client helper; do not create a new connection per request if the project already has a singleton.
- Never expose secrets or server-only environment variables to the client.
- Return clear response shapes and correct HTTP status codes.
- Check authentication and authorization on the server, not only in the UI.
- Validate inputs before database writes.
- Keep destructive operations explicit and guarded.
- If schema or model fields change, update types, migrations/seeds, API handlers, UI, tests, and docs as needed.

## Authentication and permissions

- Reuse existing auth helpers and session utilities.
- Do not invent a parallel auth flow unless explicitly asked.
- Check access both in route UI and server/API code.
- Keep role checks centralized or close to existing permission helpers.
- Do not log tokens, passwords, one-time codes, session cookies, or personal data.
- When modifying login, registration, password reset, profile, or role logic, inspect the full flow before changing one file.

## Files, images, uploads, and emails

- Use `next/image` for UI images when appropriate and allowed by config.
- Store static assets under `public/` using the project’s existing folder convention.
- Keep temporary uploads and permanent uploads separate if the project already distinguishes them.
- Update `next.config.*` when image paths, remote domains, or local patterns change.
- Use the existing email framework and email-safe styles for templates.
- Do not use browser-only APIs in server, route handler, or email rendering code.
- Keep file generation and export code isolated from UI components.

## Performance

- Keep client bundles small by avoiding unnecessary Client Components.
- Avoid expensive computation during render; precompute or memoize only when there is a clear benefit.
- Use dynamic imports for heavy client-only modules when appropriate.
- Optimize images, fonts, and third-party scripts.
- Prefer simple data flow over scattered effects.
- Avoid overusing `useEffect`; derive values where possible.
- Avoid layout-thrashing animations; prefer `transform` and `opacity`.
- Respect `prefers-reduced-motion` for meaningful animations.

## Comments and documentation

- Comments should explain why, not restate what the code already says.
- Preserve useful short file headers if the project uses them.
- Do not add long documentation blocks inside implementation files unless the project style supports it.
- Update README, docs, examples, or this file when behavior, commands, env variables, or structure changes.
- Keep user-facing text in the language already used by the project.
- Maximum component size (excluding the API): 200–250 lines.

## AI agent workflow

- Before editing, identify all affected layers: route, component, hook, store, API, type, config, migration, and tests.
- Make focused changes; avoid broad refactors while solving a narrow task.
- Keep diffs readable and easy to review.
- Preserve formatting style; do not reformat unrelated files.
- Do not create placeholders, TODO-only code, dead code, or fake implementations unless explicitly asked.
- Do not commit, push, open PRs, deploy, or modify remote resources unless the user explicitly asks.
- After changes, summarize what changed, which files changed, and which checks were run.
- If checks failed or were skipped, say so clearly.

## Final checklist

- The change solves the requested problem and does not touch unrelated areas.
- The implementation follows existing dependencies from `package.json`.
- The folder placement follows the project structure or a nearby established pattern.
- Server/client boundaries are correct.
- Types are strict and no avoidable `any` was introduced.
- Loading, error, empty, disabled, and permission states are handled where relevant.
- Secrets and private env variables remain server-only.
- Accessibility and responsive behavior were considered.
- Available scripts such as lint, test, typecheck, audit, and build were run or clearly reported as not run.
