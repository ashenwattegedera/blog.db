import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { uploadMedia } from "@/actions/media";
import { updatePost } from "@/actions/posts";
import { PostForm } from "@/components/posts/post-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit post — blog.db",
};

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const [post, categories, tags] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: { tags: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
      <PostForm
        mode="edit"
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          contentJson: post.contentJson as Record<string, unknown>,
          status: post.status,
          categoryId: post.categoryId,
          tagIds: post.tags.map((postTag) => postTag.tagId),
        }}
        categories={categories}
        tags={tags}
        updatePostAction={updatePost}
        uploadMediaAction={uploadMedia}
      />
    </div>
  );
}
