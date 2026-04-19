"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateScreenshotDescription = exports.deleteTagFromScreenshot = exports.addTagToScreenshot = exports.getScreenshotById = exports.getScreenshots = exports.deleteScreenshot = exports.uploadScreenshot = void 0;
const screenshotService = __importStar(require("../services/screenshotService"));
const validation_1 = require("../validation");
const zod_1 = require("zod");
const supabase_1 = require("../supabase/supabase");
const ensureSameUser_1 = require("../middlewares/ensureSameUser");
const uploadScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const parsedData = validation_1.uploadScreenshotSchema.parse(req.body);
        const { siteName, siteUrl, tagIds, userId, image } = parsedData;
        if (!(0, ensureSameUser_1.ensureSameUser)(req, res, userId))
            return;
        const authUserId = req.authUser.id;
        const accessToken = (_b = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace(/^Bearer\s+/i, "")) !== null && _b !== void 0 ? _b : "";
        if (!accessToken) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");
        const imageBlob = new Blob([imageBuffer], { type: "image/png" });
        // Storage key is scoped to the JWT user (enforce user-scoped bucket policies in Supabase).
        const fileName = `${authUserId}/${Date.now()}.png`;
        const supabaseClient = (0, supabase_1.createUserClient)(accessToken);
        const { error: uploadError } = yield supabaseClient.storage
            .from("screenshots")
            .upload(fileName, imageBlob, {
            contentType: "image/png",
        });
        if (uploadError) {
            throw new Error("Failed to upload image to Supabase: " +
                JSON.stringify(uploadError, null, 2));
        }
        const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/screenshots/${fileName}`;
        const screenshot = yield screenshotService.uploadScreenshot(authUserId, imageUrl, siteName, siteUrl, tagIds);
        const updatedScreenshot = yield screenshotService.getScreenshotById(authUserId, screenshot.id);
        res.status(201).json(updatedScreenshot);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ errors: error.errors });
        }
        else if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({
                errorMessage: "Failed to upload screenshot",
                error: error.message,
            });
        }
        else {
            console.error("Unexpected error:", error);
            res.status(500).json({ errorMessage: "An unexpected error occurred" });
        }
    }
});
exports.uploadScreenshot = uploadScreenshot;
const deleteScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId, screenshotId } = req.body;
    if (!(0, ensureSameUser_1.ensureSameUser)(req, res, userId))
        return;
    const accessToken = (_b = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace(/^Bearer\s+/i, "")) !== null && _b !== void 0 ? _b : "";
    if (!accessToken) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        yield screenshotService.deleteScreenshot(userId, Number(screenshotId), accessToken);
        res.status(204).send();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("not found")) {
            res.status(404).json({ error: message });
            return;
        }
        res.status(500).json({ error: "Failed to delete screenshot" });
    }
});
exports.deleteScreenshot = deleteScreenshot;
const getScreenshots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!(0, ensureSameUser_1.ensureSameUser)(req, res, userId))
        return;
    let { tag, page = "1" } = req.query;
    const pageSize = 16;
    const pageNumber = parseInt(page, 10);
    const skip = Math.max(0, (pageNumber - 1) * pageSize);
    try {
        let data;
        if (!tag) {
            data = yield screenshotService.getScreenshots(userId, skip, pageSize);
        }
        else {
            const tagNames = Array.isArray(tag) ? tag : [tag];
            data = yield screenshotService.getScreenshotsByTagName(userId, tagNames.map((tag) => tag.toString()), skip, pageSize);
        }
        const screenshots = data[0];
        const totalCount = data[1];
        const totalPages = Math.ceil(Number(totalCount) / pageSize);
        res.json({ screenshots, totalPages });
    }
    catch (err) {
        console.error("Error fetching screenshots:", err);
        res
            .status(500)
            .json({ error: "Failed to fetch screenshots", details: err });
    }
});
exports.getScreenshots = getScreenshots;
const getScreenshotById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, screenshotId } = req.params;
    if (!(0, ensureSameUser_1.ensureSameUser)(req, res, user))
        return;
    try {
        const screenshot = yield screenshotService.getScreenshotById(user, parseInt(screenshotId, 10));
        res.json(screenshot);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch screenshot" });
    }
});
exports.getScreenshotById = getScreenshotById;
const addTagToScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, screenshotId, tagId } = req.body;
    if (!(0, ensureSameUser_1.ensureSameUser)(req, res, userId))
        return;
    try {
        const screenshot = yield screenshotService.addTagToScreenshot(userId, parseInt(String(screenshotId), 10), Number(tagId));
        res.json(screenshot);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("Tag not found")) {
            res.status(400).json({ error: message });
            return;
        }
        res
            .status(500)
            .json({ error: "Failed to add tags to screenshot", err: error });
    }
});
exports.addTagToScreenshot = addTagToScreenshot;
const deleteTagFromScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, screenshotId, tagId } = req.body;
    if (!(0, ensureSameUser_1.ensureSameUser)(req, res, userId))
        return;
    try {
        const screenshot = yield screenshotService.deleteTagFromScreenshot(userId, parseInt(String(screenshotId), 10), parseInt(String(tagId), 10));
        res.json(screenshot);
    }
    catch (error) {
        console.error("Error deleting tag from screenshot:", error);
        res
            .status(500)
            .json({ error: "Failed to delete tags from screenshot", err: error });
    }
});
exports.deleteTagFromScreenshot = deleteTagFromScreenshot;
const updateDescriptionSchema = zod_1.z.object({
    screenshotId: zod_1.z.number(),
    description: zod_1.z.string().optional(),
});
const updateScreenshotDescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, description, id } = req.body;
    if (!(0, ensureSameUser_1.ensureSameUser)(req, res, userId))
        return;
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
        yield screenshotService.updateScreenshotDescription(userId, parsedData.data.screenshotId, parsedData.data.description || "");
        res.status(200).json({ message: "Description Updated", status: "OK" });
    }
    catch (error) {
        console.error("Error updating screenshot description:", error);
        res
            .status(500)
            .json({ error: "Failed to update screenshot description", err: error });
    }
});
exports.updateScreenshotDescription = updateScreenshotDescription;
