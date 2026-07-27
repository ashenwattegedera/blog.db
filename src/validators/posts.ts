import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugSchema = z
  .string()
  .trim()
  .min(1, { error: "Slug is required." })
  .max(200)
  .regex(slugPattern, {
    error: "Use lowercase letters, numbers and hyphens only.",
  });

export const postStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);

// Tiptap documents are JSON objects with `type: "doc"` at the root. We don't
// validate the full node tree — Tiptap owns that format — but we do reject
// anything that isn't a doc-shaped object.
export const tiptapDocSchema = z
  .record(z.string(), z.unknown())
  .refine((value) => value.type === "doc", {
    error: "Content must be a Tiptap document.",
  });

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Title is required." })
    .max(200),
  slug: slugSchema,
  contentJson: tiptapDocSchema,
  categoryId: z.string().min(1).nullable().optional(),
  tagIds: z.array(z.string().min(1)).max(50).default([]),
  // Names of tags that don't exist yet — created on the fly (by slug).
  newTags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  status: postStatusSchema.default("DRAFT"),
});

export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().min(1),
});

export const deletePostSchema = z.object({
  id: z.string().min(1),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type DeletePostInput = z.infer<typeof deletePostSchema>;

export type PostActionResult = { id: string } | { error: string };
export type DeletePostResult = { success: true } | { error: string };

export type CreatePostAction = (input: unknown) => Promise<PostActionResult>;
export type UpdatePostAction = (input: unknown) => Promise<PostActionResult>;
export type DeletePostAction = (input: unknown) => Promise<DeletePostResult>;
