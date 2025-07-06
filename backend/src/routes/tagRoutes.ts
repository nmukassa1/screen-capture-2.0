import express from "express";
import * as tagController from "../controllers/tagController";

const router = express.Router();

router.get("/:user", tagController.getAllTags);
router.post("/", tagController.createTag);
router.delete("/", tagController.deleteTag);
router.delete("/delete", tagController.deleteTagByName);

export default router;
