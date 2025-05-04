import express from "express";
import * as screenshotController from "../controllers/screenshotController";
import { authenticate } from "../middlewares/authenticate";

const router = express.Router();

router.get("/:userId", screenshotController.getScreenshots);
// router.post("/", upload.single("img"), screenshotController.uploadScreenshot);
router.post("/", screenshotController.uploadScreenshot);
router.delete("/", screenshotController.deleteScreenshot);
router.patch("/addTag", screenshotController.addTagToScreenshot);
router.patch("/removeTag", screenshotController.deleteTagFromScreenshot);

export default router;
