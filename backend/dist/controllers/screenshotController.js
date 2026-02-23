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
const uploadScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body
        const parsedData = validation_1.uploadScreenshotSchema.parse(req.body);
        const { siteName, siteUrl, tagIds, userId, image } = parsedData;
        // Convert base64 image to Buffer
        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");
        const imageBlob = new Blob([imageBuffer], { type: "image/png" });
        // Define image path in Supabase Storage
        const fileName = `${userId}/${Date.now()}.png`;
        // Restore user session
        const { data: restoredSession, error } = yield supabase_1.supabase.auth.getSession();
        if (error) {
            console.error("Failed to restore user session:", error);
            throw new Error("Failed to restore user session: " + JSON.stringify(error, null, 2));
        }
        if (!restoredSession.session) {
            console.error("Session restoration failed: session is null");
            throw new Error("Session restoration failed: session is null");
        }
        console.log("Restored session:", restoredSession.session);
        const supabaseClient = (0, supabase_1.createUserClient)(restoredSession.session.access_token);
        const { data, error: uploadError } = yield supabaseClient.storage
            .from("screenshots")
            .upload(fileName, imageBlob, {
            contentType: "image/png",
        });
        if (uploadError) {
            throw new Error("Failed to upload image to Supabase: " +
                JSON.stringify(uploadError, null, 2));
        }
        const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/screenshots/${fileName}`;
        // Save screenshot details in the database
        const screenshot = yield screenshotService.uploadScreenshot(userId, imageUrl, siteName, siteUrl, tagIds);
        // Return the updated screenshot with relationships
        const updatedScreenshot = yield screenshotService.getScreenshotById(userId, screenshot.id);
        console.log(updatedScreenshot);
        res.status(201).json(updatedScreenshot);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ errors: error.errors });
        }
        else if (error instanceof Error) {
            // Handle the error as an instance of the built-in Error class
            console.error(error.message);
            res.status(500).json({
                errorMessage: "Failed to upload screenshot",
                error: error.message,
            });
        }
        else {
            // Handle unexpected error types
            console.error("Unexpected error:", error);
            res.status(500).json({ errorMessage: "An unexpected error occurred" });
        }
    }
});
exports.uploadScreenshot = uploadScreenshot;
const deleteScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { user, screenshotId } = req.body;
    const accessToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
    if (!accessToken) {
        console.error("No access token provided");
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        yield screenshotService.deleteScreenshot(user, screenshotId, accessToken);
        res.status(204).send("Deleted");
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete screenshot" });
    }
});
exports.deleteScreenshot = deleteScreenshot;
const getScreenshots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    // log acccessToken from middleware
    let { tag, page = "1" } = req.query; // Default page = 1
    const pageNumber = parseInt(page, 10);
    const pageSize = 16;
    const skip = (pageNumber - 1) * pageSize;
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
        if (Array.isArray(screenshots) && screenshots.length === 0) {
            res.status(404).json({ error: "No screenshots found" });
            return;
        }
        res.json({ screenshots, totalPages });
    }
    catch (err) {
        console.error("Error fetching screenshots:", err);
        res
            .status(500)
            .json({ error: "Failed to fetch screenshots", details: err });
        return;
    }
});
exports.getScreenshots = getScreenshots;
const getScreenshotById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, screenshotId } = req.params;
    try {
        const screenshot = yield screenshotService.getScreenshotById(user, parseInt(screenshotId));
        res.json(screenshot);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch screenshot" });
    }
});
exports.getScreenshotById = getScreenshotById;
const addTagToScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, screenshotId, tagId } = req.body;
    try {
        const screenshot = yield screenshotService.addTagToScreenshot(userId, parseInt(screenshotId), tagId);
        res.json(screenshot);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Failed to add tags to screenshot", err: error });
    }
});
exports.addTagToScreenshot = addTagToScreenshot;
const deleteTagFromScreenshot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, screenshotId, tagId } = req.body;
    try {
        const screenshot = yield screenshotService.deleteTagFromScreenshot(userId, parseInt(screenshotId), parseInt(tagId));
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
    // Validate screenshot id & description
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
        const screenshotDescription = yield screenshotService.updateScreenshotDescription(userId, parsedData.data.screenshotId, parsedData.data.description || "");
        res.status(200).json({ message: "Description Updated", status: "OK" });
        // res.json({ status: true });
    }
    catch (error) {
        console.error("Error updating screenshot description:", error);
        // res.json({ status: false });
        res
            .status(500)
            .json({ error: "Failed to update screenshot description", err: error });
    }
});
exports.updateScreenshotDescription = updateScreenshotDescription;
