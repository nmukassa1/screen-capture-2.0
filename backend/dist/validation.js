"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTagSchema = exports.uploadScreenshotSchema = void 0;
const zod_1 = require("zod");
exports.uploadScreenshotSchema = zod_1.z.object({
    siteName: zod_1.z.string().min(1, "Site name is required"),
    siteUrl: zod_1.z.string().url("Invalid URL format"),
    userId: zod_1.z.string().min(1, "User ID must be an integer"),
    tagIds: zod_1.z.array(zod_1.z.number().int()),
    image: zod_1.z.string().min(1, "Image is required"),
});
exports.createTagSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, { message: "Name is required" }), // Ensuring name is a non-empty string
    userId: zod_1.z.string().min(1, { message: "User is required" }), // Ensuring user is a non-empty string
});
