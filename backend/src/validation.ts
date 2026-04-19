import { z } from "zod";

export const uploadScreenshotSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteUrl: z.string().url("Invalid URL format"),
  userId: z.string().uuid("User ID must be a valid UUID"),
  tagIds: z.array(z.number().int()),
  image: z.string().min(1, "Image is required"),
});

export const createTagSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }), // Ensuring name is a non-empty string
  userId: z.string().uuid({ message: "User ID must be a valid UUID" }),
});
