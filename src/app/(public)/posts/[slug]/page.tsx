import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { renderPostContent } from "@/lib/render-content";

export const dynamic = "force-dynamic";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  if (!post) return {};
  return { title: `${post.title} — blog.db` };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true, tags: { include: { tag: true } } },
  });
  if (!post) notFound();

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
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
      </header>
      <div className="tiptap">
        {renderPostContent(post.contentJson as Record<string, unknown>)}
      </div>
    </article>
  );
}
