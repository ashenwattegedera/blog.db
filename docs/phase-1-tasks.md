# blog.db — Phase 1 Task Plan

Dependency-ordered breakdown of `ROADMAP.md` Phase 1. This is the working
task list for agents — check items off as they land, and keep
`docs/PROJECT-STATE.md` in sync. Stay within this list; Phase 2+ items are
out of scope unless explicitly requested.

Conventions that apply to every task: AGENTS.md security rules 1–7,
`docs/server-actions.md` updated in the same commit as any action change,
descriptive migration names.

**Status: Phase 1 complete (2026-07-27).** Deviations from the original
plan noted inline.

## 0. Environment & dependencies
- [x] Install `server-only` (AGENTS.md rule 1)
- [x] Install `@prisma/adapter-pg` + `pg` (Prisma 7 driver adapter — client
      cannot connect without it)
- [x] Decide Cloudinary vs S3 for media; install that SDK
      → **Cloudinary chosen** (free tier, transforms, simplest for solo blog)
- [x] Run `npm audit` after installs — 19 findings, all in dev toolchain
      (eslint/shadcn/prisma CLIs, next's postcss/sharp); force-fix would
      downgrade core deps, deliberately not applied

## 1. Data layer
- [x] Define models in `prisma/schema.prisma`: `User` (single admin,
      email + password hash), `Post` (title, slug, Tiptap `contentJson`,
      status draft/published, category FK, timestamps), `Category`, `Tag`,
      `PostTag` (explicit m-n join), `Media` (URL + metadata)
- [x] `npx prisma migrate dev --name init_blog_schema`
- [x] `src/lib/prisma.ts` — client singleton using the `PrismaPg` adapter,
      importing from `@/generated/prisma/client`, starting with
      `import "server-only"`
- [x] Seed script: one admin user (password hashed with `bcryptjs`),
      plus a starter "General" category. Run via `npx prisma db seed`
      (wired through prisma.config.ts)

## 2. Auth
- [x] Auth.js v5 credentials provider, authorize() against the seeded admin
      via bcrypt compare, cookie sessions — `src/auth.ts` (src/ layout, not
      repo root as originally written)
- [x] `src/validators/auth.ts` — Zod login schema { email, password }
- [x] `src/actions/auth.ts` — `login` (+ `logout`) action per
      docs/server-actions.md contract
- [x] Route guard protecting `/dashboard/*` — implemented as `src/proxy.ts`
      (**Next.js 16 renamed middleware → proxy**)
- [x] `app/(admin)/login/page.tsx` — login form using `useActionState`
      **(deviation: no react-hook-form — the useActionState pattern from
      the Next 16 docs is simpler and progressively enhances without JS)**

## 3. Posts CRUD (admin)
- [x] `src/validators/posts.ts` — Zod schemas for create/update
- [x] `src/actions/posts.ts` — `createPost`, `updatePost`, `deletePost` per
      the contract; each: `import "server-only"`, in-body `auth()` check,
      Zod validation before Prisma
- [x] Dashboard shell: `app/(admin)/dashboard/layout.tsx` + post list page
- [x] `dashboard/posts/new/page.tsx` and `dashboard/posts/[id]/page.tsx`
      with the Tiptap editor (content stored as Tiptap JSON)
- [x] Category select + tag checkboxes with inline tag creation
      (`newTags: string[]` in the action input — contract updated in
      docs/server-actions.md; category stays select-only, seeded "General")

## 4. Media upload
- [x] `src/validators/media.ts` — file type/size validation **+ server-side
      magic-byte sniffing** (security-reviewer hardening note)
- [x] `src/actions/media.ts` — `uploadMedia` per contract: FormData in,
      validate, upload to Cloudinary, save URL to `Media`, return
      { url, id }; clear error when Cloudinary env vars are unset
- [x] Editor image-insert flow + dashboard media page (`/dashboard/media`)

## 5. Public pages
- [x] Home / post list (published posts only) — `(public)` route group
- [x] Post detail by slug (Tiptap JSON → React via
      `@tiptap/static-renderer` in `src/lib/render-content.tsx`)
- [x] Category page, tag page
- All public pages `force-dynamic` (Prisma queries aren't tracked by the
  Next cache; avoids stale build-time prerenders)

## 6. Gate before calling Phase 1 done
- [x] Run the `security-reviewer` subagent on all actions/routes/lib files;
      zero Blocking findings (one hardening note → magic-byte sniffing added)
- [x] `docs/server-actions.md` entries updated to reflect reality
- [x] `docs/PROJECT-STATE.md` updated; ROADMAP.md Phase 1 items checked off
- [x] Production build passes (`npm run build`)
- [x] E2E verified on local Postgres: login (good + bad credentials), post
      create/update/delete, tag replacement, validation errors, auth
      guards, public rendering
- **Remaining owner action:** fill Cloudinary keys in `.env` to enable
  uploads; deploy (Vercel + managed Postgres) when ready
