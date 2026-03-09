import { z } from "zod";

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
  image_url: z.string().url().optional().or(z.literal(""))
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
  cover_image_url: z.string().url().optional().or(z.literal(""))
});
