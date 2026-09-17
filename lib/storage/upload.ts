import "@tanstack/react-start/server-only";
import sharp from "sharp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKET, STORAGE_RULES } from "@/lib/storage/constants";
import { buildStoragePath } from "@/lib/storage/paths";
import { toThumbStoragePath } from "@/lib/storage/public-url";
import { validateImageFile } from "@/lib/storage/validation";

type StorageTarget =
  | "wishlist"
  | "giftHistory"
  | "gallery"
  | "cover"
  | "placeCover"
  | "placeGallery";

export async function uploadImageFile(options: {
  file: File;
  target: StorageTarget;
  entityId?: string;
}) {
  validateImageFile(options.file, options.target);
  const rule = STORAGE_RULES[options.target];

  const path = buildStoragePath(options.target, {
    entityId: options.entityId,
    filename: options.file.name,
    ext: "webp",
  });

  const supabase = createSupabaseAdminClient();
  const originalBuffer = Buffer.from(await options.file.arrayBuffer());
  let finalBuffer: Buffer | null = null;

  try {
    const pipeline = sharp(originalBuffer, { failOn: "none" }).rotate().resize({
      width: rule.maxWidth,
      height: rule.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });

    const qualityLevels = [78, 72, 66, 60, 55];

    for (const quality of qualityLevels) {
      const candidate = await pipeline.clone().webp({ quality, effort: 4 }).toBuffer();
      finalBuffer = candidate;
      if (candidate.byteLength <= rule.maxSizeBytes) {
        break;
      }
    }
  } catch {
    throw new Error("Không thể xử lý ảnh này. Vui lòng thử ảnh JPG, PNG hoặc WEBP khác.");
  }

  if (!finalBuffer || finalBuffer.byteLength > rule.maxSizeBytes) {
    const maxSizeMb = Math.round((rule.maxSizeBytes / (1024 * 1024)) * 10) / 10;
    throw new Error(`Ảnh sau tối ưu vẫn lớn hơn ${maxSizeMb} MB. Vui lòng chọn ảnh nhỏ hơn.`);
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, finalBuffer, {
    contentType: "image/webp",
    upsert: false,
  });

  if (error) {
    throw new Error(`Tải ảnh lên thất bại: ${error.message}`);
  }

  const thumbPath = toThumbStoragePath(path);
  try {
    const thumbBuffer = await sharp(finalBuffer, { failOn: "none" })
      .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 70, effort: 4 })
      .toBuffer();

    const { error: thumbError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(thumbPath, thumbBuffer, { contentType: "image/webp", upsert: true });

    if (thumbError) {
      await supabase.storage.from(STORAGE_BUCKET).remove([path]);
      throw new Error(`Tải ảnh thumb thất bại: ${thumbError.message}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Tải ảnh thumb thất bại:")) {
      throw error;
    }
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    throw new Error("Tải ảnh thumb thất bại: không thể xử lý thumb.");
  }

  return {
    path,
    mimeType: "image/webp",
    sizeBytes: finalBuffer.byteLength,
  };
}
