import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};
  return { title: `${category.name} — blog.db` };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
      },
    },
  });
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold tracking-tight">{category.name}</h1>
      {category.posts.length === 0 ? (
        <p className="text-muted-foreground">No posts in this category yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {category.posts.map((post) => (
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
