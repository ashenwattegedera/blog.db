# blog.db — Server Actions Reference

This is the source of truth for what server-side actions already exist.
Check here before adding a new action to avoid duplicating one under a
different name. Update this file in the same commit as any action you add,
remove, or change the signature of.

Template for each entry:

```
### actionName
- **File:** src/actions/<file>.ts
- **Input:** { field: type, ... } (Zod schema in src/validators/<file>.ts)
- **Output:** { field: type, ... } | throws
- **Auth required:** yes/no — session check performed inside the action
- **Used by:** which page/component calls this
```

---

## Auth

### login
- **File:** src/actions/auth.ts
- **Input:** { email: string, password: string }
- **Output:** redirects on success | { error: string } on failure
- **Auth required:** no (this *is* the login action)
- **Used by:** app/(admin)/login/page.tsx

## Posts

### createPost
- **File:** src/actions/posts.ts
- **Input:** { title, slug, contentJson, categoryId, tagIds[], status }
- **Output:** { id: string } | { error: string }
- **Auth required:** yes — checks `auth()` session before writing
- **Used by:** app/(admin)/dashboard/posts/new/page.tsx

### updatePost
- **File:** src/actions/posts.ts
- **Input:** { id, title?, slug?, contentJson?, categoryId?, tagIds?, status? }
- **Output:** { id: string } | { error: string }
- **Auth required:** yes
- **Used by:** app/(admin)/dashboard/posts/[id]/page.tsx

### deletePost
- **File:** src/actions/posts.ts
- **Input:** { id: string }
- **Output:** { success: true } | { error: string }
- **Auth required:** yes
- **Used by:** app/(admin)/dashboard/posts/[id]/page.tsx

## Media

### uploadMedia
- **File:** src/actions/media.ts
- **Input:** FormData (file), validated for type/size before upload
- **Output:** { url: string, id: string } | { error: string }
- **Auth required:** yes
- **Used by:** editor image-insert flow, dashboard media page

---

_As of the initial project setup, none of these actions have been
implemented yet — this file is the target contract for Phase 1. Update each
entry to reflect reality as it's built, and remove this note once the first
action exists in code._