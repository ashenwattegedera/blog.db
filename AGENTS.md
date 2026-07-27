<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

# blog.db — Claude Code project instructions

## What this project is
A personal blog platform ("blog.db") built by a single developer, for a single
admin author and public readers. See `CONTEXT.md` for product framing,
`ARCHITECTURE.md` for stack decisions, and `ROADMAP.md` for what's in scope
right now vs deferred.

Before starting any task, check `ROADMAP.md` to confirm the work is in the
current phase. Don't build ahead into a later phase without being asked.

## Stack (do not deviate without discussion)
- Next.js (App Router) — unified full-stack app, no separate Express server
- TypeScript throughout
- Prisma + PostgreSQL
- Auth.js (NextAuth) with a credentials provider, session cookies — no JWTs
  in localStorage/sessionStorage
- Server Actions for mutations; Route Handlers only where a real HTTP
  endpoint is needed (e.g. RSS feed, OG image generation)
- Tailwind CSS + shadcn/ui, Tiptap for the editor
- Deploy target: Vercel + a managed Postgres (Neon/Supabase)

If a task seems to require Express, a separate API server, or JWT-based auth,
stop and flag it rather than adding it — this is a deliberate architectural
choice, not an oversight.

## Security rules (non-negotiable)
These apply to every task that touches server-side code. Do not skip them
for "just a quick" action or route.

1. Every file under `src/lib/` and `src/actions/` that touches Prisma, env
   vars, secrets, or auth must start with `import "server-only"` as its
   first import.
2. Every Server Action and Route Handler must independently verify the
   session (`const session = await auth(); if (!session) throw ...`) inside
   the function body. Never rely on the calling page already being behind a
   protected route — Server Actions are callable directly.
3. Never import anything from `src/lib/prisma.ts` or `src/actions/*` into a
   file marked `"use client"`. If you need server data in a client
   component, pass it down as props from a Server Component.
4. Auth is session-cookie based only (Auth.js). Never introduce token
   storage in localStorage or sessionStorage.
5. Validate all external input (form data, uploaded files, query params)
   with a Zod schema in `src/validators/` before it reaches Prisma.
6. Before adding a new npm dependency, state why it's needed in the commit
   message, and run `npm audit` after installing.
7. Before committing new or changed Server Actions/Route Handlers, run the
   `security-reviewer` subagent (`.claude/agents/security-reviewer.md`) on
   the changed files.

## Conventions
- Keep the layered folders (`actions/`, `lib/`, `validators/`) even though
  this is a monolith — don't collapse business logic into page components.
- Update `docs/server-actions.md` whenever a Server Action is added, removed,
  or its signature changes. Treat it as the source of truth for "what
  actions already exist" before adding a new one.
- Update `prisma/schema.prisma` migrations with descriptive names
  (`npx prisma migrate dev --name add_post_tags`), never generic ones like
  `update`.

## What NOT to do without asking
- Don't add multi-user roles/permissions — this is single-admin by design.
- Don't introduce a separate backend service or API gateway.
- Don't add real-time features (websockets, SSE) — not in scope.
- Don't change the auth strategy or session model.

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
