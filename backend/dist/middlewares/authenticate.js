"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// If you prefer verifying manually without supabase-js
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET; // Find this in Supabase settings
function authenticate(req, res, next) {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a["sb-tpuqajccekhicnmlosod-auth-token"];
    if (!token) {
        res.status(401).json({ error: "No token" });
    }
    try {
        if (!SUPABASE_JWT_SECRET) {
            throw new Error("SUPABASE_JWT_SECRET is not defined");
        }
        const decoded = jsonwebtoken_1.default.verify(token, SUPABASE_JWT_SECRET);
        console.log("Decoded token:", decoded);
        // req.user = decoded; // Now req.user has the user's info
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
}
