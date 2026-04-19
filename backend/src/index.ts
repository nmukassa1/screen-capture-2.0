import dotenv from "dotenv";
import path from "path";

// Must run before other imports so DATABASE_URL / Supabase env are set when Prisma & routes load
const backendRoot = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(backendRoot, ".env") });
dotenv.config({ path: path.join(backendRoot, ".env.local"), override: true });

import "./types/express-augment";

import express, { Application } from "express";
import cors from "cors";
import fs from "fs-extra";
import tagRoutes from "./routes/tagRoutes";
import screenshotRoutes from "./routes/screenshotRoutes";
import authRoutes from "./routes/authRoutes";
import cookieParser from "cookie-parser";
import compression from "compression";
import { buildCorsOptions } from "./corsOptions";

const PORT = parseInt(process.env.SERVER_PORT || "4000", 10);

const app: Application = express();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.ensureDirSync(UPLOAD_DIR);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true })); 
app.use(cors(buildCorsOptions()));
app.use(cookieParser());
app.use(compression());

app.get("/", (req, res) => {
  res.json("Hello World");
});

app.use("/tags", tagRoutes);
app.use("/screenshots", screenshotRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
