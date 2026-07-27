# blog.db — Roadmap

Work should stay within the current phase unless explicitly told otherwise.
Mark items `[x]` as they're completed.

## Phase 1 — MVP (get a working blog live)
- [x] Prisma schema: `User`, `Post`, `Category`, `Tag`, `PostTag`, `Media`
- [x] Auth: single-admin login via Auth.js, session-protected `/dashboard/*`
- [x] Post CRUD: create/edit/delete/list/get-by-slug, Tiptap JSON storage
- [x] Public pages: home/post list, post detail, category page, tag page
- [x] Image upload: direct-to-Cloudinary/S3, URL saved to `Media`
      (Cloudinary; needs API keys in .env — see docs/PROJECT-STATE.md)
- [x] Basic admin dashboard: list posts, create/edit post, upload media
- [x] `security-reviewer` subagent run clean on all Phase 1 actions/routes

## Phase 2 — content quality & discoverability
- [ ] Markdown export (Tiptap JSON → Markdown, generated on demand)
- [ ] YouTube embed parsing in the editor
- [ ] SEO metadata fields per post + Open Graph image generation
- [ ] RSS feed, sitemap.xml, robots.txt
- [ ] Postgres full-text search (`search` Server Action or Route Handler)
- [ ] Reading time + table of contents generated from post headings

## Phase 3 — polish & scale
- [ ] Auto-save drafts
- [ ] Scheduled publishing (needs a scheduled job — evaluate Vercel Cron)
- [ ] Reactions / view counter
- [ ] Related articles (tag/category overlap query)
- [ ] Short URLs, share buttons
- [ ] Re-evaluate search (Meilisearch/Typesense) only if Postgres full-text
      search becomes insufficient — not a default Phase 3 task

## Explicitly deferred (not on any phase unless re-scoped)
- Multi-author support
- Comments system
- Paywall/monetization
- Mobile app / external API consumers