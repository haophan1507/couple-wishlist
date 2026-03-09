import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKET } from "@/lib/storage/constants";
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

  const path = buildStoragePath(options.target, {
    entityId: options.entityId,
    filename: options.file.name,
  });

  const supabase = createSupabaseAdminClient();
  const buffer = Buffer.from(await options.file.arrayBuffer());
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, buffer, {
    contentType: options.file.type,
    upsert: false,
  });

  if (error) {
    throw new Error("Tải ảnh lên thất bại.");
  }

  return {
    path,
    mimeType: options.file.type,
    sizeBytes: options.file.size,
  };
}
