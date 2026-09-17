export const STORAGE_BUCKET = "couple-assets";

export const STORAGE_RULES = {
  wishlist: {
    folder: "wishlist",
    maxOriginalBytes: 20 * 1024 * 1024,
    maxSizeBytes: 2.5 * 1024 * 1024,
    maxWidth: 1600,
    maxHeight: 1600,
  },
  giftHistory: {
    folder: "gifts",
    maxOriginalBytes: 20 * 1024 * 1024,
    maxSizeBytes: 2.5 * 1024 * 1024,
    maxWidth: 1600,
    maxHeight: 1600,
  },
  gallery: {
    folder: "gallery",
    maxOriginalBytes: 24 * 1024 * 1024,
    maxSizeBytes: 4 * 1024 * 1024,
    maxWidth: 2000,
    maxHeight: 2000,
  },
  cover: {
    folder: "covers",
    maxOriginalBytes: 24 * 1024 * 1024,
    maxSizeBytes: 3.5 * 1024 * 1024,
    maxWidth: 2000,
    maxHeight: 1200,
  },
  placeCover: {
    folder: "places/covers",
    maxOriginalBytes: 24 * 1024 * 1024,
    maxSizeBytes: 3.5 * 1024 * 1024,
    maxWidth: 2000,
    maxHeight: 1500,
  },
  placeGallery: {
    folder: "places/gallery",
    maxOriginalBytes: 24 * 1024 * 1024,
    maxSizeBytes: 4 * 1024 * 1024,
    maxWidth: 2000,
    maxHeight: 2000,
  },
} as const;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
