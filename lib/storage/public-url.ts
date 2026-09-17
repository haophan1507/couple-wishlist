import { STORAGE_BUCKET } from "@/lib/storage/constants";
import { getSupabasePublicEnv } from "@/lib/supabase/public-env";

/** Safe on client and server — builds the public Storage URL without service role. */
export function getPublicStorageUrl(path: string | null) {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const { supabaseUrl } = getSupabasePublicEnv();
  const normalized = path.replace(/^\/+/, "");
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${normalized}`;
}
