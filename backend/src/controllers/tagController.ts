import { Request, Response } from "express";
import * as tagService from "../services/tagService";

export const getAllTags = async (req: Request, res: Response) => {
  const { user } = req.params;
  
  try {
    const tags = await tagService.getAllTags(user);
    if (!tags) {
      res.status(404).json({ error: "Tags not found" });
      return
    }
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

export const getTagByName = async (req: Request, res: Response) => {
  try {
    const tag = await tagService.getTagByName(req.body.user.id, req.params.tagName);
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tag" });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, user } = req.body;
    const tagExist = await tagService.getTagByName(user, name);
    if (tagExist) {
      res.status(400).json({ error: "Tag already exists" });
      return
    }
    const tag = await tagService.createTag(user, name);
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: "Failed to create tag" });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  const { user, tagId } = req.body;
  try {
    await tagService.deleteTag(user, parseInt(tagId));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete tag" });
  }
};