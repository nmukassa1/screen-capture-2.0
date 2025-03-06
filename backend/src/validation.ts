import { z } from "zod";

export const uploadScreenshotSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteUrl: z.string().url("Invalid URL format"),
  userId: z.string().min(1, "User ID must be an integer"),
  tagIds: z
    .union([
      z.array(z.number().int()), // Accepts an array of numbers
      z.string().transform((str) => {
        try {
          return JSON.parse(str).map(Number); // Parses stringified arrays
        } catch {
          throw new Error("Invalid tagIds format");
        }
      }),
    ])
    .optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }), // Ensuring name is a non-empty string
  user: z.string().min(1, { message: 'User is required' })  // Ensuring user is a non-empty string
});