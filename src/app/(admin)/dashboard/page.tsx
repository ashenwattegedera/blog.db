import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { deletePost } from "@/actions/posts";
import { DeletePostButton } from "@/components/posts/delete-post-button";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Posts — blog.db",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, tags: { include: { tag: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
        <Button size="sm">
          <Link href="/dashboard/posts/new">New post</Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No posts yet. Create your first one.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {posts.map((post) => (
            <li key={post.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-medium">{post.title}</span>
                <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className={
                      post.status === "PUBLISHED"
                        ? "rounded-full bg-green-500/10 px-2 py-0.5 text-green-700 dark:text-green-400"
                        : "rounded-full bg-muted px-2 py-0.5"
                    }
                  >
                    {post.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                  <span>/{post.slug}</span>
                  {post.category ? <span>{post.category.name}</span> : null}
                  <span>
                    Updated{" "}
                    {post.updatedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {post.status === "PUBLISHED" ? (
                  <Button variant="ghost" size="sm">
                    <Link href={`/posts/${post.slug}`}>View</Link>
                  </Button>
                ) : null}
                <Button variant="outline" size="sm">
                  <Link href={`/dashboard/posts/${post.id}`}>Edit</Link>
                </Button>
                <DeletePostButton
                  id={post.id}
                  title={post.title}
                  deletePostAction={deletePost}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
