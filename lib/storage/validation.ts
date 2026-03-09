import { ALLOWED_IMAGE_TYPES, STORAGE_RULES } from "@/lib/storage/constants";

type StorageTarget = keyof typeof STORAGE_RULES;

export function validateImageFile(file: File, target: StorageTarget) {
  const rule = STORAGE_RULES[target];

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
  }

  if (file.size > rule.maxSizeBytes) {
    const maxSizeMb = Math.floor(rule.maxSizeBytes / (1024 * 1024));
    throw new Error(`Ảnh vượt quá giới hạn ${maxSizeMb} MB.`);
  }
}

export function getOptionalFile(formData: FormData, key: string) {
  const file = formData.get(key);

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}
