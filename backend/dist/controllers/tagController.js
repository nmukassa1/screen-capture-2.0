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
exports.deleteTag = exports.createTag = exports.getTagByName = exports.getAllTags = void 0;
const tagService = __importStar(require("../services/tagService"));
const validation_1 = require("../validation");
const getAllTags = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req.params;
    if (!user) {
        res.status(400).json({ error: "User not found" });
        return;
    }
    try {
        const tags = yield tagService.getAllTags(user);
        if (!tags) {
            res.status(404).json({ error: "Tags not found" });
            return;
        }
        res.json(tags);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch tags" });
    }
});
exports.getAllTags = getAllTags;
const getTagByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tag = yield tagService.getTagByName(req.body.user.id, req.params.tagName);
        res.json(tag);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch tag" });
    }
});
exports.getTagByName = getTagByName;
const createTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate the request body using the Zod schema
        const parsedBody = validation_1.createTagSchema.safeParse(req.body);
        if (!parsedBody.success) {
            // If validation fails, send a response with the validation error details
            res.status(400).json({
                error: 'Validation failed',
                issues: parsedBody.error.errors,
            });
            return;
        }
        const { name, userId } = parsedBody.data;
        const tagExist = yield tagService.getTagByName(userId, name);
        if (tagExist) {
            res.status(400).json({ error: 'Tag already exists' });
            return;
        }
        const tag = yield tagService.createTag(userId, name);
        res.status(201).json(tag);
        // res.status(201).json({ message: 'Tag created' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create tag' });
    }
});
exports.createTag = createTag;
const deleteTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, tagId } = req.body;
    try {
        yield tagService.deleteTag(userId, tagId);
        res.status(200).json('Tag deleted');
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete tag", message: err });
    }
});
exports.deleteTag = deleteTag;
