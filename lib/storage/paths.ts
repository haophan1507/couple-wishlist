import { randomUUID } from "crypto";
import { format } from "date-fns";
import { STORAGE_RULES } from "@/lib/storage/constants";

type StorageTarget = keyof typeof STORAGE_RULES;

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function buildStoragePath(target: StorageTarget, options?: { entityId?: string; filename?: string }) {
  const folder = STORAGE_RULES[target].folder;
  const ext = options?.filename?.split(".").pop()?.toLowerCase() || "jpg";
  const today = new Date();
  const year = format(today, "yyyy");
  const month = format(today, "MM");
  const entitySegment = options?.entityId ? sanitizeSegment(options.entityId) : "temp";

  return `${folder}/${year}/${month}/${entitySegment}/${randomUUID()}.${ext}`;
}
