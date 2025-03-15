import { Request, Response } from "express";
import * as screenshotService from "../services/screenshotService";
import * as tagService from "../services/tagService";
import prisma from "../prisma";
import { uploadScreenshotSchema } from "../validation";
import { z } from "zod";
import {supabase} from '../supabase/supabase' 



export const deleteScreenshot = async (req: Request, res: Response) => {
  const { user, screenshotId } = req.body;
  try {
    await screenshotService.deleteScreenshot(user, screenshotId);
    res.status(204).send('Deleted');
  } catch (error) {
    res.status(500).json({ error: "Failed to delete screenshot" });
  }
};

export const getScreenshots = async (req: Request, res: Response) => {
  const { userId } = req.params;
  let { tag } = req.query;

  console.log("Received tags:", tag);

  try {
    let screenshots;

    if (!tag) {
      // If no tags are provided, fetch all screenshots for the user
      screenshots = await screenshotService.getScreenshots(userId);
    } else {
      // Normalize tag query parameter into an array
      const tagNames = Array.isArray(tag) ? tag : [tag];
      console.log("Normalized tags:", tagNames.map(tag => tag.toString()));

      screenshots = await screenshotService.getScreenshotsByTagName(userId, tagNames.map(tag => tag.toString()));
    }

    if (screenshots.length === 0) {
      res.status(404).json({ error: "No screenshots found" });
      return;
    }

    res.json(screenshots);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch screenshots", details: err });
  }
};


export const getScreenshotById = async (req: Request, res: Response) => {
  const { user, screenshotId } = req.params;
  try {
    const screenshot = await screenshotService.getScreenshotById(user, parseInt(screenshotId));
    res.json(screenshot);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch screenshot" });
  }
}




export const uploadScreenshot = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const parsedData = uploadScreenshotSchema.parse(req.body);
    const { siteName, siteUrl, tagIds, userId, image } = parsedData;

    // if (!image) {
    //   res.status(400).json({ errorMessage: "Screenshot image is required" });
    //   return
    // }

    // Convert base64 image to Buffer
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");
    const imageBlob = new Blob([imageBuffer], { type: "image/png" })

    // Define image path in Supabase Storage
    const fileName = `screenshots/${userId}-${Date.now()}.png`;
    const { data, error: uploadError } = await supabase.storage.from("screenshots").upload(fileName, imageBlob, {
      contentType: "image/png",
    });

    if (uploadError) {
      throw new Error("Failed to upload image to Supabase: " + uploadError.message);
    }

    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/screenshots/${fileName}`;

    // Save screenshot details in the database
    const screenshot = await screenshotService.uploadScreenshot(
      userId,
      imageUrl,
      siteName,
      siteUrl
    );

  // Step 1: Fetch the valid tag IDs
  const validTagIds = await tagService.getTagByIds(userId, tagIds);
  // validTags returns this structure: {tagIds: [{id: 6}, {id: 8}]}

  // Step 2: Map the valid tag IDs to an array
  const tagIdsArray = validTagIds.map(tag => tag.id);

  // Step 3: Use the array to create the screenshot-tag relationships
  const tagScreenshotRelationship = await prisma.screenshotTag.createMany({
    data: tagIdsArray.map((tagId: number) => ({
      screenshotId: screenshot.id,
      tagId,
    })),
  });
    

    // Return the updated screenshot with relationships
    const updatedScreenshot = await screenshotService.getScreenshotById(userId, screenshot.id);
    console.log(updatedScreenshot);
    

    res.status(201).json(updatedScreenshot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ errorMessage: "Failed to upload screenshot", error: error });
    }
  }
};
