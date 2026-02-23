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
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../supabase/supabase");
const authenticate_1 = require("../middlewares/authenticate");
const prisma_1 = __importDefault(require("../prisma"));
const router = express_1.default.Router();
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        console.error("Email and password are required");
        res.status(400).json({ error: "Email and password are required" });
        return;
    }
    const { data, error } = yield supabase_1.supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) {
        console.error("Login error:", error);
        res.status(401).json({ error: error.message });
        return;
    }
    res.json({ session: data.session.access_token, user: data.user });
}));
router.post("/logout", authenticate_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = yield supabase_1.supabase.auth.signOut();
    if (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: error.message });
        return;
    }
    console.log("User logged out successfully");
    res.status(200).json({ message: "Logged out successfully" });
    return;
}));
router.delete("/delete-account/:id", authenticate_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Delete user from Supabase Auth
    const { error: authError } = yield supabase_1.supabaseSERVICE.auth.admin.deleteUser(id);
    if (authError) {
        console.error("Delete account error:", authError);
        res.status(500).json({ error: authError.message });
        return;
    }
    try {
        //Delete users SCREENSHOTS in DB using prisma
        const screenshotDeleteResult = yield prisma_1.default.screenshot.deleteMany({
            where: { userId: id },
        });
        if (!screenshotDeleteResult) {
            throw new Error(screenshotDeleteResult);
        }
        //Delete users TAGS in DB
        const tagDeleteResult = yield prisma_1.default.tag.deleteMany({
            where: { userId: id },
        });
        if (!tagDeleteResult) {
            throw new Error(tagDeleteResult);
        }
        //Delete files from STORAGE
        const { error: storageError } = yield supabase_1.supabaseSERVICE.storage
            .from("screenshots")
            .remove([`${id}`]);
        if (storageError) {
            console.error("Storage deletion error:", storageError);
            throw new Error(storageError.message);
        }
    }
    catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to delete user data" });
        return;
    }
    res.status(200).json({ message: "Account deleted successfully" });
}));
exports.default = router;
