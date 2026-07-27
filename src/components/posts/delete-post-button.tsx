"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { DeletePostAction } from "@/validators/posts";

export function DeletePostButton({
  id,
  title,
  deletePostAction,
}: {
  id: string;
  title: string;
  deletePostAction: DeletePostAction;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deletePostAction({ id });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={pending}
      >
        {pending ? "Deleting…" : "Delete"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </span>
  );
}
