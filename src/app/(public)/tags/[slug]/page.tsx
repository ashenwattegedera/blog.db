import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type TagPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return {};
  return { title: `#${tag.name} — blog.db` };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { post: { status: "PUBLISHED" } },
        orderBy: { post: { publishedAt: "desc" } },
        include: { post: true },
      },
    },
  });
  if (!tag) notFound();

  const posts = tag.posts.map((postTag) => postTag.post);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold tracking-tight">#{tag.name}</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts with this tag yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-col gap-1">
              <Link
                href={`/posts/${post.slug}`}
                className="text-xl font-medium hover:underline"
              >
                {post.title}
              </Link>
              {post.publishedAt ? (
                <time
                  dateTime={post.publishedAt.toISOString()}
                  className="text-sm text-muted-foreground"
                >
                  {post.publishedAt.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
