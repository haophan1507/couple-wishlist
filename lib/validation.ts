import { z } from "zod";

export const reservationSchema = z.object({
  wishlist_item_id: z.string().uuid(),
  visitor_name: z.string().min(2).max(100),
  visitor_email: z.string().email(),
  note: z.string().max(280).optional()
});

export const wishlistSchema = z.object({
  owner_type: z.enum(["me", "honey"]),
  title: z.string().min(2).max(120),
  description: z.string().max(400).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  product_url: z.string().url().optional().or(z.literal("")),
  price_min: z.coerce.number().nonnegative().optional(),
  price_max: z.coerce.number().nonnegative().optional(),
  category: z.string().max(60).optional(),
  priority: z.enum(["low", "medium", "high"]),
  note: z.string().max(280).optional(),
  status: z.enum(["available", "reserved", "gifted"])
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
  image_url: z.string().url().optional().or(z.literal(""))
});

export const coupleProfileSchema = z.object({
  person_one_name: z.string().min(1).max(80),
  person_two_name: z.string().min(1).max(80),
  story: z.string().max(1000).optional(),
  cover_image_url: z.string().url().optional().or(z.literal(""))
});
