# blog.db

A personal blog platform: one admin author writes posts in a rich-text
editor, the public reads them. Single Next.js app — no separate backend.

**Stack:** Next.js 16 (App Router) · TypeScript · Prisma 7 + PostgreSQL ·
Auth.js v5 (credentials, cookie sessions) · Server Actions · Tailwind 4 +
shadcn/ui · Tiptap editor · Cloudinary media storage

## Getting started

1. **Install dependencies:** `npm install`
2. **Configure `.env`:**
   - `DATABASE_URL` — PostgreSQL connection string
   - `AUTH_SECRET` — `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials for the seeded admin
   - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` —
     from https://console.cloudinary.com/ (image uploads fail gracefully
     until set)
3. **Migrate + seed:** `npx prisma migrate dev && npx prisma db seed`
4. **Run:** `npm run dev` → http://localhost:3000 (admin at `/login`)

## Project docs

- `CONTEXT.md` / `ARCHITECTURE.md` / `ROADMAP.md` — product framing,
  architecture decisions, phased scope. Read these first.
- `AGENTS.md` — security rules and conventions (mandatory for code changes).
- `docs/server-actions.md` — source of truth for existing Server Actions.
- `docs/PROJECT-STATE.md` — what's implemented, known issues, owner to-dos.
- `docs/phase-1-tasks.md` — completed Phase 1 task list.

## Useful commands

- `npm run dev` / `npm run build` / `npm run lint`
- `npx prisma migrate dev --name <descriptive_name>` — schema changes
- `npx prisma db seed` — seed admin + starter category
- `npx prisma studio` — browse the database
