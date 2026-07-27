# blog.db — Product Context

## What it is
A personal blog platform built and run by a single developer, for
themselves. One admin author writes and publishes posts; the public reads
them. There is no multi-tenancy, no team accounts, and no plan to onboard
other authors.

## Who it's for
- **The admin (owner)**: writes posts in a rich-text editor, manages media,
  publishes/schedules content, checks basic analytics.
- **Readers**: browse posts, read by category/tag, search, subscribe via
  RSS, share posts.

## Scale expectations
Personal-blog traffic — tens to low hundreds of thousands of monthly
visitors at the high end, not enterprise scale. This directly justifies
architectural choices in `ARCHITECTURE.md`: a monolith is sufficient, no
need for service separation, queues, or horizontal scaling infrastructure
up front.

## Explicit non-goals
- No multi-user roles or permissions system.
- No separate mobile app or third-party API consumers (yet — if this
  changes, revisit `ARCHITECTURE.md` before building around it).
- No real-time features (comments with live updates, websockets, etc.).
- No monetization/paywall features unless explicitly added to the roadmap.
- No enterprise auth (SSO, multi-factor, org-level permissions) — single
  admin login only.

## Definition of "done" for the MVP
A working blog where the admin can log in, write a post with rich text and
images, publish it, and a public visitor can browse, read, and find posts
by category/tag. See `ROADMAP.md` Phase 1 for the exact feature list.