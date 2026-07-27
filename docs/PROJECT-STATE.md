# blog.db — Project State

Living snapshot of what actually exists vs. what the docs describe. Update
this file whenever a phase item lands or the environment changes. For
*decisions* see `ARCHITECTURE.md`; for *scope* see `ROADMAP.md`; for the
action contract see `docs/server-actions.md`.

Last verified: 2026-07-27 (after Phase 1 implementation)

## Current stage

**Phase 1 implemented.** Auth, post CRUD, media upload, dashboard and public
pages are built and verified end-to-end on a local Postgres. Production
build (`npm run build`) passes; `security-reviewer` ran with zero Blocking
findings.

## What exists

- **Data layer:** `prisma/schema.prisma` with `User`, `Post`, `Category`,
  `Tag`, `PostTag`, `Media` + migration `init_blog_schema` applied to local
  Postgres (`blogdb`). `src/lib/prisma.ts` singleton (PrismaPg adapter).
  `prisma/seed.ts` (run: `npx prisma db seed`) seeds the admin user and a
  "General" category.
- **Auth:** `src/auth.ts` (Auth.js v5 Credentials provider, bcrypt verify,
  JWT-in-httpOnly-cookie sessions), `src/proxy.ts` route guard
  (Next.js 16 renamed middleware → proxy), login/logout actions, login page
  at `/login`, dashboard guarded by proxy + per-page `auth()` checks.
- **Posts CRUD:** `src/actions/posts.ts` (create/update/delete), dashboard
  list (`/dashboard`), new/edit pages with Tiptap editor
  (`src/components/posts/editor.tsx`, StarterKit + Image), tag checkboxes +
  inline tag creation, category select, slug auto-generation.
- **Media:** `src/actions/media.ts` `uploadMedia` (Zod validate →
  magic-byte sniff → Cloudinary upload → `Media` row), media library page
  (`/dashboard/media`), editor image-insert button.
- **Public pages:** `(public)` route group — home (`/`), post detail
  (`/posts/[slug]`), category and tag pages. Tiptap JSON rendered via
  `@tiptap/static-renderer` (`src/lib/render-content.tsx`). All
  `force-dynamic` (Prisma queries bypass Next's cache tracking).
- **Seeded admin:** `admin@blog.db` (password generated, stored in `.env`).

## Action required from the owner

- **Cloudinary keys:** `.env` has empty `CLOUDINARY_CLOUD_NAME` /
  `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`. Uploads return a clear
  "not configured" error until filled in. Get them from
  https://console.cloudinary.com/ → API Keys.

## Conventions established this phase

- Client components never import `@/actions/*` or `@/lib/prisma` (rule 3) —
  Server Components pass actions as props; shared action types live in
  `src/validators/` next to the Zod schemas.
- `src/auth.ts` (not repo root) because the app uses `src/`; proxy is
  `src/proxy.ts` (Next 16 naming — do not create `middleware.ts`).
- Editor extension set (StarterKit + Image) must stay in sync between
  `src/components/posts/editor.tsx` and `src/lib/render-content.tsx`.

## Known issues / deferred

- `npm audit` reports 19 vulns (15 high), ALL in the dev toolchain
  (eslint/shadcn CLI/prisma CLI/next's bundled postcss+sharp). None in app
  runtime deps (server-only, adapter-pg, pg, cloudinary, tiptap are clean).
  `npm audit fix --force` would downgrade next/prisma/eslint to absurd
  versions — deliberately NOT applied.
- React Compiler / react-hook-form / @tanstack/react-query installed but
  unused so far — forms use `useActionState`/local state (see
  docs/phase-1-tasks.md deviation note).
- No tests yet (no test runner configured).
- No pagination on post lists (fine at blog scale; revisit in Phase 3).
- README.md replaced with project-specific setup instructions.

## Technical notes for future sessions

- **This is Next.js 16** — middleware is `proxy.ts`; docs live in
  `node_modules/next/dist/docs/`.
- Prisma 7: driver adapter required; import client from
  `@/generated/prisma/client`; `server-only` throws outside the RSC
  bundler, so standalone scripts (seed, checks) must instantiate their own
  PrismaClient instead of importing `src/lib/prisma.ts`.
- Server Action IDs are unstable in dev — test actions in-process
  (temporary route calling the action functions) or via the UI, not by
  curling `Next-Action` endpoints.
