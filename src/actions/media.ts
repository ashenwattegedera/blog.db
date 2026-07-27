"use server";

import "server-only";

import { auth } from "@/auth";
import { getCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import {
  ALLOWED_IMAGE_TYPES,
  sniffImageType,
  uploadMediaSchema,
  type UploadMediaResult,
} from "@/validators/media";

export async function uploadMedia(
  formData: FormData,
): Promise<UploadMediaResult> {
  const session = await auth();
  if (!session?.user) return { error: "You must be signed in." };

  const parsed = uploadMediaSchema.safeParse({
    file: formData.get("file"),
    altText: formData.get("altText") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid file." };
  }

  const cloudinary = getCloudinary();
  if (!cloudinary) {
    return {
      error:
        "Media storage is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    };
  }

  const { file, altText } = parsed.data;
  const bytes = Buffer.from(await file.arrayBuffer());

  // Trust the bytes, not the client-declared content type.
  const sniffedType = sniffImageType(bytes);
  if (
    !sniffedType ||
    !(ALLOWED_IMAGE_TYPES as readonly string[]).includes(sniffedType)
  ) {
    return { error: "File contents are not a supported image." };
  }
  const dataUri = `data:${sniffedType};base64,${bytes.toString("base64")}`;

  let uploaded;
  try {
    uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: "blogdb",
      resource_type: "image",
    });
  } catch {
    return { error: "Upload to media storage failed." };
  }

  const media = await prisma.media.create({
    data: {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      altText: altText ?? null,
      width: uploaded.width ?? null,
      height: uploaded.height ?? null,
      format: uploaded.format ?? null,
      sizeBytes: uploaded.bytes ?? null,
    },
  });

  return { url: media.url, id: media.id };
}
