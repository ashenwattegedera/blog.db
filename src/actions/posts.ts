"use server";

import "server-only";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createPostSchema,
  deletePostSchema,
  updatePostSchema,
  type DeletePostResult,
  type PostActionResult,
} from "@/validators/posts";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Create any not-yet-existing tags (matched by slug) and return all ids. */
async function resolveTagIds(tagIds: string[], newTags: string[]): Promise<string[]> {
  const ids = [...tagIds];
  for (const name of newTags) {
    const slug = slugify(name);
    if (!slug) continue;
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name: name.trim(), slug },
    });
    ids.push(tag.id);
  }
  return [...new Set(ids)];
}

export async function createPost(input: unknown): Promise<PostActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "You must be signed in." };

  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid post data." };
  }
  const data = parsed.data;

  const slugTaken = await prisma.post.findUnique({ where: { slug: data.slug } });
  if (slugTaken) return { error: "That slug is already in use." };

  const tagIds = await resolveTagIds(data.tagIds, data.newTags);

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: data.slug,
      contentJson: data.contentJson as Prisma.InputJsonValue,
      status: data.status,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      author: { connect: { id: userId } },
      category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      tags: { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) },
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  return { id: post.id };
}

export async function updatePost(input: unknown): Promise<PostActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "You must be signed in." };

  const parsed = updatePostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid post data." };
  }
  const { id, ...fields } = parsed.data;

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "Post not found." };

  if (fields.slug && fields.slug !== existing.slug) {
    const slugTaken = await prisma.post.findUnique({ where: { slug: fields.slug } });
    if (slugTaken) return { error: "That slug is already in use." };
  }

  const tagsProvided = fields.tagIds !== undefined || fields.newTags !== undefined;
  const tagIds = tagsProvided
    ? await resolveTagIds(fields.tagIds ?? [], fields.newTags ?? [])
    : null;

  const post = await prisma.$transaction(async (tx) => {
    if (tagIds) {
      await tx.postTag.deleteMany({ where: { postId: id } });
      await tx.postTag.createMany({
        data: tagIds.map((tagId) => ({ postId: id, tagId })),
      });
    }

    return tx.post.update({
      where: { id },
      data: {
        title: fields.title,
        slug: fields.slug,
        contentJson: fields.contentJson as Prisma.InputJsonValue | undefined,
        categoryId: fields.categoryId === undefined ? undefined : fields.categoryId,
        status: fields.status,
        // First publish sets the date; unpublishing keeps the original date.
        publishedAt:
          fields.status === "PUBLISHED" && !existing.publishedAt
            ? new Date()
            : undefined,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/posts/${existing.slug}`);
  if (post.slug !== existing.slug) revalidatePath(`/posts/${post.slug}`);
  return { id: post.id };
}

export async function deletePost(
  input: unknown,
): Promise<DeletePostResult> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "You must be signed in." };

  const parsed = deletePostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid post id." };
  }

  const existing = await prisma.post.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return { error: "Post not found." };

  await prisma.post.delete({ where: { id: parsed.data.id } });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath(`/posts/${existing.slug}`);
  return { success: true };
}
