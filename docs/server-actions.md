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

Convention: client components never import action modules directly
(AGENTS.md rule 3). Server Components pass action functions down as props;
the shared action types live beside the schemas in `src/validators/`.

---

## Auth

### login
- **File:** src/actions/auth.ts
- **Input:** `(prevState, FormData)` { email: string, password: string }
  (Zod: `loginSchema` in src/validators/auth.ts)
- **Output:** redirects to `/dashboard` on success | { error: string }
- **Auth required:** no (this *is* the login action)
- **Used by:** app/(admin)/login/page.tsx → components/auth/login-form.tsx
  (`useActionState`)

### logout
- **File:** src/actions/auth.ts
- **Input:** none
- **Output:** redirects to `/login`
- **Auth required:** no (clears the session cookie; harmless when signed out)
- **Used by:** app/(admin)/dashboard/layout.tsx sign-out form

## Posts

### createPost
- **File:** src/actions/posts.ts
- **Input:** { title, slug, contentJson, categoryId?, tagIds[], newTags[],
  status } — `newTags` are tag *names* created on the fly (matched by slug)
  (Zod: `createPostSchema` in src/validators/posts.ts)
- **Output:** { id: string } | { error: string }
- **Auth required:** yes — checks `auth()` session before writing
- **Used by:** app/(admin)/dashboard/posts/new/page.tsx →
  components/posts/post-form.tsx (prop `createPostAction`)

### updatePost
- **File:** src/actions/posts.ts
- **Input:** { id, title?, slug?, contentJson?, categoryId?, tagIds?,
  newTags?, status? } (Zod: `updatePostSchema`). When `tagIds`/`newTags`
  are provided, the post's tag set is *replaced*.
- **Output:** { id: string } | { error: string }
- **Auth required:** yes
- **Used by:** app/(admin)/dashboard/posts/[id]/page.tsx →
  components/posts/post-form.tsx (prop `updatePostAction`)

### deletePost
- **File:** src/actions/posts.ts
- **Input:** { id: string } (Zod: `deletePostSchema`)
- **Output:** { success: true } | { error: string }
- **Auth required:** yes
- **Used by:** app/(admin)/dashboard/page.tsx →
  components/posts/delete-post-button.tsx (prop `deletePostAction`)

## Media

### uploadMedia
- **File:** src/actions/media.ts
- **Input:** FormData (file), validated for type/size, then magic-byte
  sniffed before upload (Zod: `uploadMediaSchema` in src/validators/media.ts)
- **Output:** { url: string, id: string } | { error: string }
- **Auth required:** yes
- **Used by:** editor image-insert flow (components/posts/editor.tsx, via
  PostForm prop) and app/(admin)/dashboard/media/page.tsx →
  components/media/media-upload-form.tsx (prop `uploadMediaAction`)
- **Requires:** CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY /
  CLOUDINARY_API_SECRET in .env; returns a clear error when unset.
