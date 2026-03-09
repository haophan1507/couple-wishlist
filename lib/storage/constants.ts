export const STORAGE_BUCKET = "couple-assets";

export const STORAGE_RULES = {
  wishlist: {
    folder: "wishlist",
    maxSizeBytes: 4 * 1024 * 1024,
  },
  giftHistory: {
    folder: "gifts",
    maxSizeBytes: 4 * 1024 * 1024,
  },
  gallery: {
    folder: "gallery",
    maxSizeBytes: 6 * 1024 * 1024,
  },
  cover: {
    folder: "covers",
    maxSizeBytes: 6 * 1024 * 1024,
  },
  placeCover: {
    folder: "places/covers",
    maxSizeBytes: 6 * 1024 * 1024,
  },
  placeGallery: {
    folder: "places/gallery",
    maxSizeBytes: 6 * 1024 * 1024,
  },
} as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
