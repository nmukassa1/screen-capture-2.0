"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Must run before other imports so DATABASE_URL / Supabase env are set when Prisma & routes load
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const tagRoutes_1 = __importDefault(require("./routes/tagRoutes"));
const screenshotRoutes_1 = __importDefault(require("./routes/screenshotRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const PORT = parseInt(process.env.SERVER_PORT || "4000", 10);
const app = (0, express_1.default)();
// Ensure upload directory exists
const UPLOAD_DIR = path_1.default.join(__dirname, "uploads");
fs_extra_1.default.ensureDirSync(UPLOAD_DIR);
// Middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
// app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use((0, cors_1.default)({ origin: "*" }));
app.use((0, cookie_parser_1.default)());
app.use((0, compression_1.default)());
app.get("/", (req, res) => {
    res.json("Hello World");
});
app.use("/tags", tagRoutes_1.default);
app.use("/screenshots", screenshotRoutes_1.default);
app.use("/auth", authRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
