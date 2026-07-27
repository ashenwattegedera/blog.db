---
name: blogdb-server-actions
description: Project workflow for adding or changing a Server Action or Route Handler in blog.db. Use whenever creating/editing files under src/actions/ or app/api/, or when a task involves mutations, auth checks, or input validation. Encodes the AGENTS.md security rules and docs/server-actions.md contract so nothing is skipped.
---

# blog.db — Server Action workflow

Follow these steps in order for every new or changed Server Action / Route
Handler. Skipping steps violates project conventions (AGENTS.md).

## 1. Check the contract first

Read `docs/server-actions.md` before writing anything. It is the source of
truth for existing actions — do not create a duplicate under a different
name. If the action exists, match its documented signature or update the
doc in the same commit.

## 2. Validate input with Zod

Every external input (form data, files, query params) gets a schema in
`src/validators/<domain>.ts` **before** it reaches Prisma. Reuse/extend the
domain's validator file rather than inlining schemas in the action.

## 3. Write the action with the required guards

File lives in `src/actions/<domain>.ts`:

```ts
"use server";

import "server-only"; // first import — non-negotiable (rule 1)
import { auth } from "@/auth";
// ...

export async function doThing(input: unknown) {
  const session = await auth();          // in-body check (rule 2) —
  if (!session) return { error: "..." }; // never rely on page protection

  const parsed = schema.safeParse(input); // Zod before Prisma (rule 5)
  if (!parsed.success) return { error: "..." };

  // ...Prisma call
}
```

- Return `{ ... } | { error: string }` per the contract style — don't throw
  for expected failures.
- `auth.ts` (Auth.js) lives at `src/auth.ts` (src/ layout); session checks
  use `auth()`.

## 4. Never cross the client/server boundary

- No imports from `src/lib/prisma.ts` or `src/actions/*` in `"use client"`
  files (rule 3). **The established pattern: a Server Component imports the
  action and passes it to the client component as a prop** (e.g.
  `<PostForm createPostAction={createPost} />`). Shared action types live
  beside the schemas in `src/validators/` and are imported with
  `import type` (compile-time only).
- No `localStorage`/`sessionStorage` for anything auth-related (rule 4) —
  sessions are httpOnly cookies only.

## 5. Update the docs in the same commit

Add/update the entry in `docs/server-actions.md` using its template (File /
Input / Output / Auth required / Used by).

## 6. Review before commit

Run the `security-reviewer` subagent (`.agents/security-reviewer.md`) on all
changed server-side files. Zero Blocking findings required. If a new npm
dependency was added, the commit message must state why, and `npm audit`
must have been run after install (rule 6).
