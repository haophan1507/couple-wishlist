import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { STORAGE_BUCKET } from "@/lib/storage/constants";

export async function deleteStorageFile(path: string | null | undefined) {
  if (!path) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) {
    throw new Error(`Xóa ảnh cũ thất bại: ${path}`);
  }
}
