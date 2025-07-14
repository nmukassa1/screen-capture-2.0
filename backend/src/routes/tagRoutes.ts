import express from "express";
import * as tagController from "../controllers/tagController";
import { authenticate } from "../middlewares/authenticate";

const router = express.Router();

router.get("/:user", authenticate, tagController.getAllTags);
router.post("/", authenticate, tagController.createTag);
router.delete("/", tagController.deleteTagById);
router.delete("/delete", authenticate, tagController.deleteTagByName);

export default router;
