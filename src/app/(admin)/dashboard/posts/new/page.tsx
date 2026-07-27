import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { uploadMedia } from "@/actions/media";
import { createPost } from "@/actions/posts";
import { PostForm } from "@/components/posts/post-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "New post — blog.db",
};

export default async function NewPostPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      <PostForm
        mode="create"
        categories={categories}
        tags={tags}
        createPostAction={createPost}
        uploadMediaAction={uploadMedia}
      />
    </div>
  );
}
