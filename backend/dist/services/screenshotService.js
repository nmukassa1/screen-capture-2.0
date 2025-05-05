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
exports.deleteTagFromScreenshot = exports.addTagToScreenshot = exports.deleteScreenshot = exports.getScreenshotsByTagName = exports.getScreenshotById = exports.getScreenshots = exports.uploadScreenshot = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const uploadScreenshot = (userId, img, siteName, siteUrl, tagIds) => __awaiter(void 0, void 0, void 0, function* () {
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
            // Removed invalid orderBy clause as 'createdAt' does not exist in the type
            include: { tags: { include: { tag: true } } },
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
        where: { name: { in: tagNames } },
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
            include: { tags: { include: { tag: true } } },
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
const deleteScreenshot = (userId, screenshotId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.screenshot.delete({
        where: { id: screenshotId, userId },
    });
});
exports.deleteScreenshot = deleteScreenshot;
const addTagToScreenshot = (userId, screenshotId, tagId) => __awaiter(void 0, void 0, void 0, function* () {
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
