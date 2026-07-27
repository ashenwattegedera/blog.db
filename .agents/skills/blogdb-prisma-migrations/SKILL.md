---
name: blogdb-prisma-migrations
description: Project workflow for Prisma schema and migration changes in blog.db (Prisma v7 + PostgreSQL). Use whenever adding/changing models, running migrations, or instantiating Prisma Client. Covers the v7 driver-adapter requirement, descriptive migration naming, and the schema-as-source-of-truth convention.
---

# blog.db — Prisma workflow (v7)

`prisma/schema.prisma` is the single source of truth for the data model —
keep it authoritative over any other document describing entities
(ARCHITECTURE.md). This project is on **Prisma 7.9**, which has breaking
changes vs older training-data Prisma.

## Changing the data model

1. Edit `prisma/schema.prisma` (models, relations, enums).
2. Migrate with a **descriptive name** — never `update`, `fix`, etc.:
   ```bash
   npx prisma migrate dev --name add_post_tags
   ```
3. `npx prisma generate` regenerates the client into
   `src/generated/prisma/` (the generator block already sets this output —
   do not move it without updating imports everywhere).
4. If the change affects a documented entity, check whether
   `docs/PROJECT-STATE.md` needs a sync.

## Client usage (v7 specifics — easy to get wrong)

- **Driver adapter is required** for PostgreSQL. The singleton in
  `src/lib/prisma.ts` must look like:
  ```ts
  import "server-only"; // always first (AGENTS.md rule 1)
  import { PrismaClient } from "@/generated/prisma/client";
  import { PrismaPg } from "@prisma/adapter-pg";
  ```
  instantiated with `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`.
- Import from `@/generated/prisma/client`, **not** `@prisma/client`.
- Use `satisfies Prisma.ModelSelect` for type-safe query fragments —
  `Prisma.validator()` is removed in v7.
- Env loading is explicit: `prisma.config.ts` already imports
  `dotenv/config`; keep that import if the file is regenerated.

## Guardrails

- Never hand-edit files in `prisma/migrations/` after they've been applied.
- Never pass raw (unvalidated) input into a Prisma call — Zod schemas live
  in `src/validators/` (see the `blogdb-server-actions` skill).
- Prisma-touching files under `src/lib/` or `src/actions/` start with
  `import "server-only"` and are never imported into `"use client"` files.
- For deeper v7 questions (ESM, removed features, adapters), consult the
  vendored `prisma-upgrade-v7` and `prisma-cli` skills.
