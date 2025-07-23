import { Request, Response } from "express";
import * as tagService from "../services/tagService";
import { createTagSchema } from "../validation";

export const getAllTags = async (req: Request, res: Response) => {
  const { user } = req.params;

  if (!user) {
    console.error("User not found in request parameters");

    res.status(400).json({ error: "User not found" });
    return;
  }

  try {
    const tags = await tagService.getAllTags(user);
    if (!tags) {
      res.status(404).json({ error: "Tags not found" });
      return;
    }
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

export const getTagByName = async (req: Request, res: Response) => {
  try {
    const tag = await tagService.getTagByName(
      req.body.user.id,
      req.params.tagName
    );
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tag" });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    // Validate the request body using the Zod schema
    const parsedBody = createTagSchema.safeParse(req.body);

    if (!parsedBody.success) {
      // If validation fails, send a response with the validation error details
      res.status(400).json({
        error: "Validation failed",
        issues: parsedBody.error.errors,
      });
      return;
    }

    const { name, userId } = parsedBody.data;

    const tagExist = await tagService.getTagByName(userId, name);
    if (tagExist) {
      res.status(400).json({ error: "Tag already exists" });
      return;
    }

    const tag = await tagService.createTag(userId, name);
    res.status(201).json(tag);
    // res.status(201).json({ message: 'Tag created' });
  } catch (error) {
    res.status(500).json({ error: "Failed to create tag" });
  }
};

export const deleteTagById = async (req: Request, res: Response) => {
  const { userId, tagId } = req.body;
  try {
    await tagService.deleteTag(userId, tagId);
    res.status(200).json("Tag deleted");
  } catch (err) {
    res.status(500).json({ error: "Failed to delete tag", message: err });
  }
};

export const deleteTagByName = async (req: Request, res: Response) => {
  const { userId, tagName } = req.body;
  if (!userId || !tagName) {
    res.status(400).json({ error: "User ID and tag name are required" });
    return;
  }

  try {
    await tagService.deleteTagByName(userId, tagName);
    res.status(200).json("Tag deleted");
  } catch (err) {
    console.error(
      `Error deleting tag: ${tagName} for user ${userId}:`,
      (err as Error).message
    );
    res.status(500).json({ error: "Failed to delete tag", message: err });
  }
};
