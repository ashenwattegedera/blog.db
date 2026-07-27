import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { uploadMedia } from "@/actions/media";
import { MediaUploadForm } from "@/components/media/media-upload-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Media — blog.db",
};

export default async function MediaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Media</h1>
        <MediaUploadForm uploadMediaAction={uploadMedia} />
      </div>

      {media.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No uploads yet. Images you upload here or from the editor appear in
          this library.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <li
              key={item.id}
              className="flex flex-col overflow-hidden rounded-md border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded arbitrary remote images */}
              <img
                src={item.url}
                alt={item.altText ?? ""}
                className="aspect-square w-full object-cover"
              />
              <div className="flex flex-col gap-1 p-2 text-xs text-muted-foreground">
                <span className="truncate" title={item.url}>
                  {item.url}
                </span>
                <span>
                  {item.width && item.height
                    ? `${item.width}×${item.height}`
                    : "unknown size"}
                  {item.format ? ` · ${item.format}` : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
