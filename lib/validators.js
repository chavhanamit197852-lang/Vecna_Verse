import { z } from "zod";

export const eventInput = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().default("Other"),
  city: z.string().min(1, "City is required"),
  venue: z.string().min(1, "Venue is required"),

  // Accepts "" or valid URL
  coverImage: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().url().optional()
  ),

  // Accepts "2026-11-06T10:00" AND "2026-11-06T10:00:00.000Z"
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),

  registrationDeadline: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.date().optional()
  ),

  // Accepts "" or number
  capacity: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().min(0).optional()
  ),

  aictePoints: z.preprocess(
    (v) => (v === "" || v === null ? 0 : v),
    z.coerce.number().min(0).default(0)
  ),

  ticketPrice: z.preprocess(
    (v) => (v === "" || v === null ? 0 : v),
    z.coerce.number().min(0).default(0)
  ),

  aicteCategory: z.string().optional(),

  // Accepts null, undefined, or { lat, lng }
  location: z.preprocess(
    (v) => (v === null ? undefined : v),
    z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional()
  ),
});