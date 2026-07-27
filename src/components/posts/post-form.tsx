"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { PostEditor } from "@/components/posts/editor";
import { Button } from "@/components/ui/button";
import type { UploadMediaAction } from "@/validators/media";
import type { CreatePostAction, UpdatePostAction } from "@/validators/posts";

type TaxonomyOption = { id: string; name: string };

export type PostFormInitial = {
  id: string;
  title: string;
  slug: string;
  contentJson: Record<string, unknown>;
  status: "DRAFT" | "PUBLISHED";
  categoryId: string | null;
  tagIds: string[];
};

type PostFormBaseProps = {
  categories: TaxonomyOption[];
  tags: TaxonomyOption[];
  uploadMediaAction: UploadMediaAction;
};

type PostFormProps =
  | (PostFormBaseProps & { mode: "create"; createPostAction: CreatePostAction })
  | (PostFormBaseProps & {
      mode: "edit";
      initial: PostFormInitial;
      updatePostAction: UpdatePostAction;
    });

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const inputClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function PostForm(props: PostFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const initial = props.mode === "edit" ? props.initial : null;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(props.mode === "edit");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initial?.status ?? "DRAFT",
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initial?.tagIds ?? [],
  );
  const [newTags, setNewTags] = useState("");
  const [contentJson, setContentJson] = useState<Record<string, unknown>>(
    initial?.contentJson ?? { type: "doc", content: [{ type: "paragraph" }] },
  );

  function toggleTag(id: string) {
    setSelectedTagIds((current) =>
      current.includes(id)
        ? current.filter((tagId) => tagId !== id)
        : [...current, id],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const input = {
      title,
      slug: slug || slugify(title),
      contentJson,
      categoryId: categoryId || null,
      tagIds: selectedTagIds,
      newTags: newTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      status,
    };

    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await props.createPostAction(input)
          : await props.updatePostAction({ id: props.initial.id, ...input });

      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugTouched) setSlug(slugify(event.target.value));
          }}
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="slug" className="text-sm font-medium">
          Slug
        </label>
        <input
          id="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Content</span>
        <PostEditor
          initialContent={initial?.contentJson}
          onChange={setContentJson}
          uploadMediaAction={props.uploadMediaAction}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={inputClass}
          >
            <option value="">None</option>
            {props.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as "DRAFT" | "PUBLISHED")}
            className={inputClass}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Tags</legend>
        {props.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {props.tags.map((tag) => (
              <label
                key={tag.id}
                className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs"
              >
                <input
                  type="checkbox"
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        ) : null}
        <input
          placeholder="Add new tags, comma separated"
          value={newTags}
          onChange={(event) => setNewTags(event.target.value)}
          className={inputClass}
        />
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving…"
            : props.mode === "create"
              ? "Create post"
              : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
