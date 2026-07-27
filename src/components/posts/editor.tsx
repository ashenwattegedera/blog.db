"use client";

import type { JSONContent } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { UploadMediaAction } from "@/validators/media";

type PostEditorProps = {
  initialContent?: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  uploadMediaAction: UploadMediaAction;
};

const toolbarButtonClass = (active: boolean) =>
  cn(
    "rounded-md border border-border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50",
    active ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted",
  );

export function PostEditor({
  initialContent,
  onChange,
  uploadMediaAction,
}: PostEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: (initialContent ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    }) as JSONContent,
    immediatelyRender: false,
    onUpdate({ editor: instance }) {
      onChange(instance.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class: "tiptap min-h-72 rounded-b-md px-4 py-3 outline-none",
      },
    },
  });

  async function handleImageFile(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadMediaAction(formData);
      if ("error" in result) {
        setUploadError(result.error);
        return;
      }
      editor?.chain().focus().setImage({ src: result.url }).run();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-md border border-input bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
        <button
          type="button"
          className={toolbarButtonClass(Boolean(editor?.isActive("bold")))}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
        >
          Bold
        </button>
        <button
          type="button"
          className={toolbarButtonClass(Boolean(editor?.isActive("italic")))}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
        >
          Italic
        </button>
        <button
          type="button"
          className={toolbarButtonClass(Boolean(editor?.isActive("strike")))}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          disabled={!editor}
        >
          Strike
        </button>
        <button
          type="button"
          className={toolbarButtonClass(Boolean(editor?.isActive("heading", { level: 2 })))}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={!editor}
        >
          H2
        </button>
        <button
          type="button"
          className={toolbarButtonClass(Boolean(editor?.isActive("heading", { level: 3 })))}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={!editor}
        >
          H3
        </button>
        <button
          type="button"
          className={toolbarButtonClass(Boolean(editor?.isActive("bulletList")))}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={!editor}
        >
          Bullets
        </button>
        <button
          type="button"
          className={toolbarButtonClass(Boolean(editor?.isActive("orderedList")))}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={!editor}
        >
          Numbered
        </button>
        <button
          type="button"
          className={toolbarButtonClass(Boolean(editor?.isActive("blockquote")))}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          disabled={!editor}
        >
          Quote
        </button>
        <button
          type="button"
          className={toolbarButtonClass(Boolean(editor?.isActive("codeBlock")))}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          disabled={!editor}
        >
          Code
        </button>
        <button
          type="button"
          className={toolbarButtonClass(false)}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          disabled={!editor}
        >
          Divider
        </button>
        <button
          type="button"
          className={toolbarButtonClass(false)}
          onClick={() => fileInputRef.current?.click()}
          disabled={!editor || uploading}
        >
          {uploading ? "Uploading…" : "Image"}
        </button>
        <button
          type="button"
          className={toolbarButtonClass(false)}
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
        >
          Undo
        </button>
        <button
          type="button"
          className={toolbarButtonClass(false)}
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
        >
          Redo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImageFile(file);
            event.target.value = "";
          }}
        />
      </div>
      <EditorContent editor={editor} />
      {uploadError ? (
        <p role="alert" className="px-3 pb-2 text-xs text-destructive">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}
