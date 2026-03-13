import sharp from "sharp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKET, STORAGE_RULES } from "@/lib/storage/constants";
import { buildStoragePath } from "@/lib/storage/paths";
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
  const pipeline = sharp(originalBuffer, { failOn: "none" })
    .rotate()
    .resize({
      width: rule.maxWidth,
      height: rule.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });

  const qualityLevels = [84, 78, 72, 66, 60];
  let finalBuffer: Buffer | null = null;

  for (const quality of qualityLevels) {
    const candidate = await pipeline.clone().webp({ quality, effort: 4 }).toBuffer();
    finalBuffer = candidate;
    if (candidate.byteLength <= rule.maxSizeBytes) {
      break;
    }
  }

  if (!finalBuffer || finalBuffer.byteLength > rule.maxSizeBytes) {
    const maxSizeMb = Math.floor(rule.maxSizeBytes / (1024 * 1024));
    throw new Error(`Ảnh sau tối ưu vẫn lớn hơn ${maxSizeMb} MB. Vui lòng chọn ảnh nhỏ hơn.`);
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, finalBuffer, {
    contentType: "image/webp",
    upsert: false,
  });

  if (error) {
    throw new Error("Tải ảnh lên thất bại.");
  }

  return {
    path,
    mimeType: "image/webp",
    sizeBytes: finalBuffer.byteLength,
  };
}
