import { Request, Response } from "express";
import * as screenshotService from "../services/screenshotService";
import { uploadScreenshotSchema } from "../validation";
import { z } from "zod";
import { createUserClient } from "../supabase/supabase";
import { ensureSameUser } from "../middlewares/ensureSameUser";

export const uploadScreenshot = async (req: Request, res: Response) => {
  try {
    const parsedData = uploadScreenshotSchema.parse(req.body);
    const { siteName, siteUrl, tagIds, userId, image } = parsedData;

    if (!ensureSameUser(req, res, userId)) return;

    const authUserId = req.authUser!.id;
    const accessToken =
      req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
    if (!accessToken) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");
    const imageBlob = new Blob([imageBuffer], { type: "image/png" });

    // Storage key is scoped to the JWT user (enforce user-scoped bucket policies in Supabase).
    const fileName = `${authUserId}/${Date.now()}.png`;
    const supabaseClient = createUserClient(accessToken);

    const { error: uploadError } = await supabaseClient.storage
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

    const screenshot = await screenshotService.uploadScreenshot(
      authUserId,
      imageUrl,
      siteName,
      siteUrl,
      tagIds
    );

    const updatedScreenshot = await screenshotService.getScreenshotById(
      authUserId,
      screenshot.id
    );

    res.status(201).json(updatedScreenshot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
    } else if (error instanceof Error) {
      console.error(error.message);
      res.status(500).json({
        errorMessage: "Failed to upload screenshot",
        error: error.message,
      });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ errorMessage: "An unexpected error occurred" });
    }
  }
};

export const deleteScreenshot = async (req: Request, res: Response) => {
  const { userId, screenshotId } = req.body;
  if (!ensureSameUser(req, res, userId)) return;

  const accessToken =
    req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
  if (!accessToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await screenshotService.deleteScreenshot(
      userId,
      Number(screenshotId),
      accessToken
    );
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("not found")) {
      res.status(404).json({ error: message });
      return;
    }
    res.status(500).json({ error: "Failed to delete screenshot" });
  }
};

export const getScreenshots = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!ensureSameUser(req, res, userId)) return;

  let { tag, page = "1" } = req.query;

  const pageSize = 16;
  const pageNumber = parseInt(page as string, 10);
  const skip = Math.max(0, (pageNumber - 1) * pageSize);

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

    res.json({ screenshots, totalPages });
  } catch (err) {
    console.error("Error fetching screenshots:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch screenshots", details: err });
  }
};

export const getScreenshotById = async (req: Request, res: Response) => {
  const { user, screenshotId } = req.params;
  if (!ensureSameUser(req, res, user)) return;

  try {
    const screenshot = await screenshotService.getScreenshotById(
      user,
      parseInt(screenshotId, 10)
    );
    res.json(screenshot);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch screenshot" });
  }
};

export const addTagToScreenshot = async (req: Request, res: Response) => {
  const { userId, screenshotId, tagId } = req.body;
  if (!ensureSameUser(req, res, userId)) return;

  try {
    const screenshot = await screenshotService.addTagToScreenshot(
      userId,
      parseInt(String(screenshotId), 10),
      Number(tagId)
    );
    res.json(screenshot);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Tag not found")) {
      res.status(400).json({ error: message });
      return;
    }
    res
      .status(500)
      .json({ error: "Failed to add tags to screenshot", err: error });
  }
};

export const deleteTagFromScreenshot = async (req: Request, res: Response) => {
  const { userId, screenshotId, tagId } = req.body;
  if (!ensureSameUser(req, res, userId)) return;

  try {
    const screenshot = await screenshotService.deleteTagFromScreenshot(
      userId,
      parseInt(String(screenshotId), 10),
      parseInt(String(tagId), 10)
    );
    res.json(screenshot);
  } catch (error) {
    console.error("Error deleting tag from screenshot:", error);
    res
      .status(500)
      .json({ error: "Failed to delete tags from screenshot", err: error });
  }
};

const updateDescriptionSchema = z.object({
  screenshotId: z.number(),
  description: z.string().optional(),
});

export const updateScreenshotDescription = async (
  req: Request,
  res: Response
) => {
  const { userId, description, id } = req.body;

  if (!ensureSameUser(req, res, userId)) return;

  const parsedData = updateDescriptionSchema.safeParse({
    screenshotId: id,
    description: description,
  });

  if (!parsedData.success) {
    console.error("Invalid input data:", parsedData.error);
    res.status(400).json({
      error: "Invalid input",
      details: parsedData.error.errors,
    });
    return;
  }
  try {
    await screenshotService.updateScreenshotDescription(
      userId,
      parsedData.data.screenshotId,
      parsedData.data.description || ""
    );

    res.status(200).json({ message: "Description Updated", status: "OK" });
  } catch (error) {
    console.error("Error updating screenshot description:", error);
    res
      .status(500)
      .json({ error: "Failed to update screenshot description", err: error });
  }
};
