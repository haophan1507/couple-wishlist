export const STORAGE_BUCKET = "couple-assets";

export const STORAGE_RULES = {
  wishlist: {
    folder: "wishlist",
    maxOriginalBytes: 20 * 1024 * 1024,
    maxSizeBytes: 4 * 1024 * 1024,
    maxWidth: 1800,
    maxHeight: 1800,
  },
  giftHistory: {
    folder: "gifts",
    maxOriginalBytes: 20 * 1024 * 1024,
    maxSizeBytes: 4 * 1024 * 1024,
    maxWidth: 1800,
    maxHeight: 1800,
  },
  gallery: {
    folder: "gallery",
    maxOriginalBytes: 24 * 1024 * 1024,
    maxSizeBytes: 6 * 1024 * 1024,
    maxWidth: 2200,
    maxHeight: 2200,
  },
  cover: {
    folder: "covers",
    maxOriginalBytes: 24 * 1024 * 1024,
    maxSizeBytes: 6 * 1024 * 1024,
    maxWidth: 2400,
    maxHeight: 1400,
  },
  placeCover: {
    folder: "places/covers",
    maxOriginalBytes: 24 * 1024 * 1024,
    maxSizeBytes: 6 * 1024 * 1024,
    maxWidth: 2400,
    maxHeight: 1800,
  },
  placeGallery: {
    folder: "places/gallery",
    maxOriginalBytes: 24 * 1024 * 1024,
    maxSizeBytes: 6 * 1024 * 1024,
    maxWidth: 2200,
    maxHeight: 2200,
  },
} as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
