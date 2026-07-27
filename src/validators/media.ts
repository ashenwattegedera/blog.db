import { z } from "zod";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, { error: "File is empty." })
  .refine((file) => file.size <= MAX_IMAGE_BYTES, {
    error: "Image must be 10 MB or smaller.",
  })
  .refine((file) =>
    (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type), {
    error: "Only JPEG, PNG, WebP, GIF or AVIF images are allowed.",
  });

export const uploadMediaSchema = z.object({
  file: fileSchema,
  altText: z.string().trim().max(300).optional(),
});

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;

export type UploadMediaResult = { url: string; id: string } | { error: string };

export type UploadMediaAction = (
  formData: FormData,
) => Promise<UploadMediaResult>;

/**
 * Detect the real image type from magic bytes. The client-supplied
 * `file.type` is only a hint — never trust it for the upload.
 */
export function sniffImageType(bytes: Buffer): string | null {
  if (bytes.length < 12) return null;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e &&
    bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a &&
    bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  // GIF: "GIF8"
  if (
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return "image/gif";
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 &&
    bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 &&
    bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  // AVIF: .... "ftyp" "avif"/"avis"
  if (
    bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 &&
    bytes[7] === 0x70 && bytes[8] === 0x61 && bytes[9] === 0x76 &&
    bytes[10] === 0x69 && (bytes[11] === 0x66 || bytes[11] === 0x73)
  ) {
    return "image/avif";
  }
  return null;
}
