import express from "express";
import * as screenshotController from "../controllers/screenshotController";

const router = express.Router();

router.get("/:userId", screenshotController.getScreenshots);
// router.post("/", upload.single("img"), screenshotController.uploadScreenshot);
router.post("/", screenshotController.uploadScreenshot);
router.delete("/", screenshotController.deleteScreenshot);

export default router;