import { z } from "zod";

export const wishlistSchema = z.object({
  owner_type: z.enum(["me", "honey"]),
  title: z.string().min(2).max(120),
  description: z.string().max(400).optional(),
  existing_image_path: z.string().max(300).optional().or(z.literal("")),
  product_url: z.string().url().optional().or(z.literal("")),
  price_min: z.coerce.number().nonnegative().optional(),
  price_max: z.coerce.number().nonnegative().optional(),
  category: z.string().max(60).optional(),
  priority: z.enum(["low", "medium", "high"]),
  note: z.string().max(280).optional(),
  status: z.enum(["available", "gifted"])
});

export const specialDaySchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(400).optional(),
  date: z.string().date(),
  type: z.enum(["birthday", "anniversary", "relationship", "holiday", "other"])
});

export const gallerySchema = z.object({
  caption: z.string().max(200).optional(),
  memory_date: z.string().date().optional().or(z.literal("")),
  existing_image_path: z.string().max(300).optional().or(z.literal(""))
});

export const giftHistorySchema = z.object({
  recipient_owner_type: z.enum(["me", "honey"]),
  gift_name: z.string().min(2).max(120),
  giver_name: z.string().min(1).max(120),
  received_date: z.string().date(),
  special_day_id: z.string().uuid().optional().or(z.literal("")),
  note: z.string().max(600).optional(),
  existing_photo_path: z.string().max(300).optional().or(z.literal("")),
  wishlist_item_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["received", "thanked", "archived"])
});

export const coupleProfileSchema = z.object({
  person_one_name: z.string().min(1).max(80),
  person_two_name: z.string().min(1).max(80),
  love_start_date: z.string().date().optional().or(z.literal("")),
  person_one_birthday: z.string().date().optional().or(z.literal("")),
  person_two_birthday: z.string().date().optional().or(z.literal("")),
  person_one_favorite: z.string().max(200).optional(),
  person_two_favorite: z.string().max(200).optional(),
  person_one_hobby: z.string().max(200).optional(),
  person_two_hobby: z.string().max(200).optional(),
  story: z.string().max(1000).optional(),
  existing_cover_image_path: z.string().max(300).optional().or(z.literal(""))
});

export const placeMemorySchema = z
  .object({
    title: z.string().min(2).max(120),
    slug: z.string().max(160).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(["visited", "planned"]),
    visit_date: z.string().date().optional().or(z.literal("")),
    location_name: z.string().min(2).max(160),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    city: z.string().max(80).optional(),
    country: z.string().max(80).optional(),
    existing_cover_image_path: z.string().max(300).optional().or(z.literal("")),
    gallery_captions: z.string().max(4000).optional()
  })
  .refine(
    (value) =>
      (!value.latitude && !value.longitude) ||
      (typeof value.latitude === "number" && typeof value.longitude === "number"),
    {
      message: "Latitude và longitude phải đi cùng nhau.",
      path: ["latitude"]
    }
  );
