import { Request, Response } from "express";
import * as screenshotService from "../services/screenshotService";
import prisma from "../prisma";
import { uploadScreenshotSchema } from "../validation";
import { z } from "zod";

export const uploadScreenshot = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const parsedData = uploadScreenshotSchema.parse(req.body);
    const { siteName, siteUrl, tagIds, userId } = parsedData;
    const img = "image.jpg"; // Temporary placeholder

    // Upload the screenshot
    const screenshot = await screenshotService.uploadScreenshot(
      userId,
      img,
      siteName,
      siteUrl
    );

    // Insert screenshot-tag relationships
    if (tagIds && tagIds.length > 0) {
      await prisma.screenshotTag.createMany({
        data: tagIds.map((tagId: number) => ({
          screenshotId: screenshot.id,
          tagId,
        })),
      });
    }

    // Return the updated screenshot with relationships
    const updatedScreenshot = await screenshotService.getScreenshotById(userId, screenshot.id);
    res.status(201).json(updatedScreenshot);
    return
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    }
    console.error("Error uploading screenshot:", error);
    res.status(500).json({ errorMessage: "Failed to upload screenshot", error });
  }
};

export const getScreenshots = async (req: Request, res: Response) => {
  const { user } = req.params;
  try {
    const screenshots = await screenshotService.getScreenshots((user));
    if (screenshots.length === 0) {
      res.status(404).json({ error: "No screenshots created" });
      return;
    }
    res.json(screenshots);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch screenshots" });
  }
};

export const deleteScreenshot = async (req: Request, res: Response) => {
  const { user, screenshotId } = req.body;
  try {
    await screenshotService.deleteScreenshot(user, screenshotId);
    res.status(204).send('Deleted');
  } catch (error) {
    res.status(500).json({ error: "Failed to delete screenshot" });
  }
};

export const getScreenshotsByTag = async (req: Request, res: Response) => {
  const { user, tagId } = req.params;
  try {
    const screenshots = await screenshotService.getScreenshotsByTag(user, parseInt(tagId));
    if (screenshots.length === 0) {
      res.status(404).json({ error: "No screenshots found for tag" });
      return;
    }
    res.json(screenshots);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch screenshots" });
  }
}