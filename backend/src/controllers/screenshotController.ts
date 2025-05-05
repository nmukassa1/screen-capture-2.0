import { Request, Response } from "express";
import * as screenshotService from "../services/screenshotService";
import { uploadScreenshotSchema } from "../validation";
import { z } from "zod";
import { supabase } from "../supabase/supabase";

export const uploadScreenshot = async (req: Request, res: Response) => {
  try {
    // const { data: session, error: sessionError } =
    //   await supabase.auth.getUser();
    // console.log("Session:", session);
    // if (sessionError) {
    //   throw new Error(
    //     "Failed to get session: " + JSON.stringify(sessionError, null, 2)
    //   );
    // }

    // Validate request body
    const parsedData = uploadScreenshotSchema.parse(req.body);
    const { siteName, siteUrl, tagIds, userId, image } = parsedData;

    console.log("Parsed Data:", parsedData);

    // Convert base64 image to Buffer
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");
    const imageBlob = new Blob([imageBuffer], { type: "image/png" });

    // Define image path in Supabase Storage
    const fileName = `screenshots/${userId}-${Date.now()}.png`;
    const { data, error: uploadError } = await supabase.storage
      .from("screenshots")
      .upload(fileName, imageBlob, {
        contentType: "image/png",
      });

    if (uploadError) {
      throw new Error(
        "Failed to upload image to Supabase: " +
          JSON.stringify(uploadError, null, 2)
      );
    }

    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/screenshots/${fileName}`;

    // Save screenshot details in the database
    const screenshot = await screenshotService.uploadScreenshot(
      userId,
      imageUrl,
      siteName,
      siteUrl,
      tagIds
    );

    // Return the updated screenshot with relationships
    const updatedScreenshot = await screenshotService.getScreenshotById(
      userId,
      screenshot.id
    );
    console.log(updatedScreenshot);

    res.status(201).json(updatedScreenshot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else if (error instanceof Error) {
      // Handle the error as an instance of the built-in Error class
      console.error(error.message);
      res.status(500).json({
        errorMessage: "Failed to upload screenshot",
        error: error.message,
      });
    } else {
      // Handle unexpected error types
      console.error("Unexpected error:", error);
      res.status(500).json({ errorMessage: "An unexpected error occurred" });
    }
  }
};

export const deleteScreenshot = async (req: Request, res: Response) => {
  const { user, screenshotId } = req.body;
  try {
    await screenshotService.deleteScreenshot(user, screenshotId);
    res.status(204).send("Deleted");
  } catch (error) {
    res.status(500).json({ error: "Failed to delete screenshot" });
  }
};

export const getScreenshots = async (req: Request, res: Response) => {
  const { userId } = req.params;
  let { tag, page = "1" } = req.query; // Default page = 1

  const pageNumber = parseInt(page as string, 10);
  const pageSize = 16;
  const skip = (pageNumber - 1) * pageSize;

  try {
    let data;

    if (!tag) {
      data = await screenshotService.getScreenshots(userId, skip, pageSize);
    } else {
      const tagNames = Array.isArray(tag) ? tag : [tag];
      data = await screenshotService.getScreenshotsByTagName(
        userId,
        tagNames.map((tag) => tag.toString()),
        skip,
        pageSize
      );
    }

    const screenshots = data[0];
    const totalCount = data[1];

    const totalPages = Math.ceil(Number(totalCount) / pageSize);

    if (Array.isArray(screenshots) && screenshots.length === 0) {
      res.status(404).json({ error: "No screenshots found" });
      return;
    }

    res.json({ screenshots, totalPages });

    // res.json({
    //   data: screenshots,
    //   totalPages,
    //   currentPage: pageNumber,
    // });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch screenshots", details: err });
    return;
  }
};

export const getScreenshotById = async (req: Request, res: Response) => {
  const { user, screenshotId } = req.params;
  try {
    const screenshot = await screenshotService.getScreenshotById(
      user,
      parseInt(screenshotId)
    );
    res.json(screenshot);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch screenshot" });
  }
};

export const addTagToScreenshot = async (req: Request, res: Response) => {
  const { userId, screenshotId, tagId } = req.body;

  try {
    const screenshot = await screenshotService.addTagToScreenshot(
      userId,
      parseInt(screenshotId),
      tagId
    );
    res.json(screenshot);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add tags to screenshot", err: error });
  }
};

export const deleteTagFromScreenshot = async (req: Request, res: Response) => {
  const { userId, screenshotId, tagId } = req.body;
  try {
    const screenshot = await screenshotService.deleteTagFromScreenshot(
      userId,
      parseInt(screenshotId),
      parseInt(tagId)
    );
    res.json(screenshot);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete tags from screenshot", err: error });
  }
};
