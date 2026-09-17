import "@tanstack/react-start/server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKET } from "@/lib/storage/constants";
import { toThumbStoragePath } from "@/lib/storage/public-url";

export async function deleteStorageFile(path: string | null | undefined) {
  if (!path) {
    return;
  }

  const paths = [path];
  const thumb = toThumbStoragePath(path);
  if (thumb !== path) {
    paths.push(thumb);
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);

  if (error) {
    throw new Error(`Xóa ảnh cũ thất bại: ${path}`);
  }
}
