import express from "express";
import * as screenshotController from "../controllers/screenshotController";

const router = express.Router();

router.get("/:userId", screenshotController.getScreenshots);
