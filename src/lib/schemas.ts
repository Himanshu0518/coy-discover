import { z } from "zod";

/** Shared by the route handlers and the browser client. */
export const publicProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().int(),
  city: z.string(),
  college: z.string(),
  bio: z.string(),
  interests: z.array(z.string()),
  photo: z.string(),
});

export const feedResponseSchema = z.object({
  profiles: z.array(publicProfileSchema),
});

export const matchSummarySchema = z.object({
  matchedAt: z.string(),
  profile: publicProfileSchema,
});

export const matchesResponseSchema = z.object({
  matches: z.array(matchSummarySchema),
});

export const swipeResponseSchema = z.object({
  match: z.boolean(),
  duplicate: z.boolean(),
  matchProfile: publicProfileSchema.optional(),
});

export const swipeRequestSchema = z.object({
  profileId: z.string().trim().min(1).max(64),
  direction: z.enum(["like", "pass"]),
});
