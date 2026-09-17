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

/** Sibling thumb path: `uuid.webp` → `uuid.thumb.webp`. */
export function toThumbStoragePath(path: string) {
  if (path.endsWith(".thumb.webp")) return path;
  if (path.endsWith(".webp")) return path.replace(/\.webp$/i, ".thumb.webp");
  // absolute URLs or odd paths: return as-is (caller should not thumb them)
  return path;
}

export function getPublicThumbUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return getPublicStorageUrl(toThumbStoragePath(path));
}
