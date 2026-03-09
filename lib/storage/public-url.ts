import { STORAGE_BUCKET } from "@/lib/storage/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export function getPublicStorageUrl(path: string | null) {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const supabase = createSupabaseAdminClient();
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
