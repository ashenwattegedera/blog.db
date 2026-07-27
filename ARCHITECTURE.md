# blog.db — Architecture Decisions

This file records *decisions*, not just the stack, so an agent working on
this repo understands why things are the way they are and doesn't
"helpfully" reintroduce a pattern that was deliberately rejected.

## Decision: Unified Next.js app, not a split frontend/backend
**Chosen:** One Next.js project handling both UI and server logic (Server
Actions, Route Handlers), deployed as a single unit.
**Rejected:** Separate Next.js frontend + Express API in two codebases.
**Why:** Single developer, single frontend consumer, no current need for
the API to serve other clients. The split setup's main benefit — a clean
reusable REST API and physical separation of client/server code — isn't
worth the cost of two codebases, two deploy targets, and CORS
configuration for a solo project at this scale.
**Revisit if:** A second client (mobile app, external integration) needs to
consume the same backend. At that point, add Route Handlers under
`app/api/` rather than migrating to a separate server.

## Decision: Server Actions over hand-rolled REST endpoints
**Chosen:** Mutations (create/edit/delete post, upload media, login) as
Server Actions (`'use server'` functions).
**Why:** Removes the routes → controllers → services → repositories
layering that a blog's small feature set doesn't need. Less boilerplate
per feature.
**Trade-off accepted:** Server Actions compile to real POST endpoints and
are directly callable — each one must do its own auth check (see
`CLAUDE.md` security rules). This is a known trade-off, not an oversight.

## Decision: Auth.js with session cookies, not JWT
**Chosen:** Auth.js (NextAuth) credentials provider, httpOnly secure
session cookies.
**Rejected:** Manually issued JWTs stored client-side.
**Why:** Single-admin login doesn't need JWT's cross-service portability.
Cookie sessions aren't readable by JavaScript, closing off a common XSS
vector that comes with storing tokens in localStorage.

## Decision: Prisma + PostgreSQL
**Chosen:** Prisma ORM against a managed Postgres instance (Neon or
Supabase).
**Why:** Strong typing end-to-end, straightforward migrations, and
Postgres's built-in full-text search covers the search feature (Phase 1/2)
without adding a separate search service. `prisma/schema.prisma` is the
single source of truth for the data model — keep it authoritative over any
other document describing entities.

## Decision: Rich text stored as Tiptap JSON
**Chosen:** Editor content stored as Tiptap's native JSON in the `Post`
table, converted to Markdown/HTML on demand rather than stored redundantly.
**Why:** Avoids keeping multiple representations of the same content in
sync; JSON is the richest, most future-proof format to convert *from*.

## Decision: Media via Cloudinary/S3, not local disk
**Chosen:** Uploads go directly to object storage; only the returned URL is
saved to the `Media` table.
**Why:** Keeps the app server stateless and avoids managing file storage on
the deploy target.

## Deployment
Vercel (single deploy target for the Next.js app) + managed Postgres
(Neon/Supabase). No Docker Compose needed for local dev unless a future
decision changes this — a single `npm run dev` should be sufficient.