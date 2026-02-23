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
exports.getTagByIds = exports.deleteTagByName = exports.deleteTag = exports.createTag = exports.getTagByName = exports.getAllTags = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getAllTags = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.tag.findMany({
        where: { userId },
        orderBy: { name: "asc" },
    });
});
exports.getAllTags = getAllTags;
const getTagByName = (userId, name) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.tag.findFirst({ where: { userId, name } });
});
exports.getTagByName = getTagByName;
const createTag = (userId, name) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.tag.create({ data: { userId, name } });
});
exports.createTag = createTag;
const deleteTag = (userId, tagId) => __awaiter(void 0, void 0, void 0, function* () {
    const tag = yield prisma_1.default.tag.findFirst({
        where: { id: tagId, userId },
    });
    if (!tag)
        throw new Error("Tag not found");
    return yield prisma_1.default.tag.delete({
        where: { id: tag.id },
    });
});
exports.deleteTag = deleteTag;
const deleteTagByName = (userId, tagName) => __awaiter(void 0, void 0, void 0, function* () {
    const tag = yield prisma_1.default.tag.findFirst({
        where: { name: tagName, userId },
    });
    console.log("(SERVICE) Deleting tags:", tag);
    if (!tag)
        throw new Error("Tag not found");
    return yield prisma_1.default.tag.delete({
        where: { id: tag.id },
    });
});
exports.deleteTagByName = deleteTagByName;
const getTagByIds = (userId, tagIds) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.tag.findMany({
        where: { id: { in: tagIds }, userId },
        select: { id: true },
    });
});
exports.getTagByIds = getTagByIds;
