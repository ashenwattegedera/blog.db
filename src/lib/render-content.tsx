import "server-only";

import type { JSONContent } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { renderToReactElement } from "@tiptap/static-renderer";

/**
 * Render a stored Tiptap JSON document to React elements for public pages.
 * Must use the same extension set as the editor (src/components/posts/editor.tsx).
 */
export function renderPostContent(contentJson: Record<string, unknown>) {
  return renderToReactElement({
    content: contentJson as JSONContent,
    extensions: [StarterKit, Image],
  });
}
