"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateScreenshotDescription = exports.deleteTagFromScreenshot = exports.addTagToScreenshot = exports.deleteScreenshot = exports.getScreenshotsByTagName = exports.getScreenshotById = exports.getScreenshots = exports.uploadScreenshot = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const supabase_1 = require("../supabase/supabase");
const uploadScreenshot = (userId, img, siteName, siteUrl, tagIds) => __awaiter(void 0, void 0, void 0, function* () {
    if (tagIds === null || tagIds === void 0 ? void 0 : tagIds.length) {
        const owned = yield prisma_1.default.tag.findMany({
            where: { userId, id: { in: tagIds } },
            select: { id: true },
        });
        if (owned.length !== tagIds.length) {
            throw new Error("One or more tags are invalid or do not belong to this user");
        }
    }
    const screenshot = yield prisma_1.default.screenshot.create({
        data: {
            userId,
            img,
            siteName,
            siteUrl,
            tags: tagIds ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
        },
        include: { tags: true },
    });
    return screenshot;
});
exports.uploadScreenshot = uploadScreenshot;
const getScreenshots = (userId, skip, take) => __awaiter(void 0, void 0, void 0, function* () {
    const [screenshots, totalCount] = yield Promise.all([
        prisma_1.default.screenshot.findMany({
            where: { userId },
            skip,
            take,
            include: { tags: { include: { tag: true } }, description: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.screenshot.count({
            where: { userId },
        }),
    ]);
    return [screenshots, totalCount];
});
exports.getScreenshots = getScreenshots;
const getScreenshotById = (userId, screenshotId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.screenshot.findUnique({
        where: { id: screenshotId, userId },
        include: { tags: { include: { tag: true } } },
    });
});
exports.getScreenshotById = getScreenshotById;
const getScreenshotsByTagName = (userId, tagNames, skip, take) => __awaiter(void 0, void 0, void 0, function* () {
    const tags = yield prisma_1.default.tag.findMany({
        where: { userId, name: { in: tagNames } },
        select: { id: true },
    });
    const tagIds = tags.map((tag) => tag.id);
    if (tagIds.length === 0) {
        return [[], 0]; // Represents screenshots and totalCount for page
    }
    const [screenshots, totalCount] = yield Promise.all([
        prisma_1.default.screenshot.findMany({
            where: {
                userId,
                tags: { some: { tagId: { in: tagIds } } },
            },
            skip,
            take,
            include: { tags: { include: { tag: true } }, description: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.screenshot.count({
            where: {
                userId,
                tags: { some: { tagId: { in: tagIds } } },
            },
        }),
    ]);
    return [screenshots, totalCount];
});
exports.getScreenshotsByTagName = getScreenshotsByTagName;
const deleteScreenshot = (userId, screenshotId, accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the screenshot record (to get the file path)
    const screenshot = yield prisma_1.default.screenshot.findFirst({
        where: { id: screenshotId, userId },
    });
    if (!screenshot) {
        console.error("Screenshot not found or unauthorized access attempt");
        throw new Error("Screenshot not found or unauthorized");
    }
    const extractPathFromUrl = (url) => {
        const parsedUrl = new URL(url);
        return parsedUrl.pathname.replace("/storage/v1/object/public/screenshots/", "");
    };
    const imageToDelete = extractPathFromUrl(screenshot.img);
    console.log("Image to delete:", imageToDelete);
    try {
        // Restore user session
        if (!accessToken) {
            throw new Error("Access token is required");
        }
        const supabaseClient = (0, supabase_1.createUserClient)(accessToken);
        const { data, error } = yield supabaseClient.storage
            .from("screenshots") // your bucket name
            .remove([imageToDelete]); // must match key you used when uploading
        console.log("Supabase storage remove data:", data);
        // Delete image from Supabase Storage
        // const { error } = await supabase.storage
        //   .from("screenshots") // your bucket name
        //   .remove([imageToDelete]); // must match key you used when uploading
        if (error) {
            throw new Error("Storage deletion failed");
        }
        return yield prisma_1.default.screenshot.delete({
            where: { id: screenshotId, userId },
        });
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
exports.deleteScreenshot = deleteScreenshot;
const addTagToScreenshot = (userId, screenshotId, tagId) => __awaiter(void 0, void 0, void 0, function* () {
    const tag = yield prisma_1.default.tag.findFirst({ where: { id: tagId, userId } });
    if (!tag) {
        throw new Error("Tag not found or does not belong to this user");
    }
    return yield prisma_1.default.screenshot.update({
        where: { id: screenshotId, userId },
        data: {
            tags: {
                create: { tagId },
            },
        },
    });
});
exports.addTagToScreenshot = addTagToScreenshot;
const deleteTagFromScreenshot = (userId, screenshotId, tagId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.screenshot.update({
        where: { id: screenshotId, userId },
        data: {
            tags: {
                deleteMany: { screenshotId, tagId },
            },
        },
    });
});
exports.deleteTagFromScreenshot = deleteTagFromScreenshot;
const updateScreenshotDescription = (userId, screenshotId, description) => __awaiter(void 0, void 0, void 0, function* () {
    // First, ensure the screenshot belongs to the user (optional auth check)
    const screenshot = yield prisma_1.default.screenshot.findFirst({
        where: { id: screenshotId, userId },
    });
    if (!screenshot) {
        throw new Error("Screenshot not found.");
    }
    // Does screenshotId exist in description table
    const descriptionExists = yield prisma_1.default.screenshotDescription.findFirst({
        where: { screenshotId },
    });
    if (!descriptionExists) {
        return yield prisma_1.default.screenshotDescription.create({
            data: {
                content: description,
                screenshotId,
            },
        });
    }
    else {
        return yield prisma_1.default.screenshotDescription.update({
            where: { screenshotId }, // because it's unique
            data: { content: description },
        });
    }
});
exports.updateScreenshotDescription = updateScreenshotDescription;
