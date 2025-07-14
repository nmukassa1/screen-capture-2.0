import express from "express";
import * as screenshotController from "../controllers/screenshotController";
import { authenticate } from "../middlewares/authenticate";

const router = express.Router();

router.get("/:userId", authenticate, screenshotController.getScreenshots);
router.post("/", authenticate, screenshotController.uploadScreenshot);
router.delete("/", authenticate, screenshotController.deleteScreenshot);
router.patch("/addTag", authenticate, screenshotController.addTagToScreenshot);
router.patch(
  "/removeTag",
  authenticate,
  screenshotController.deleteTagFromScreenshot
);

export default router;
