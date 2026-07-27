import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "blog.db",
  description: "A personal blog.",
};

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { category: true, tags: { include: { tag: true } } },
  });

  return (
    <div className="flex flex-col gap-10">
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts published yet.</p>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              <Link href={`/posts/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {post.publishedAt ? (
                <time dateTime={post.publishedAt.toISOString()}>
                  {post.publishedAt.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              ) : null}
              {post.category ? (
                <Link
                  href={`/categories/${post.category.slug}`}
                  className="hover:text-foreground hover:underline"
                >
                  {post.category.name}
                </Link>
              ) : null}
              {post.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="hover:text-foreground hover:underline"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
