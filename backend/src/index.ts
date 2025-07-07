import express, { Application, Request, Response } from "express";
import cors from "cors";
import fs from "fs-extra";
import path from "path";
import tagRoutes from "./routes/tagRoutes";
import screenshotRoutes from "./routes/screenshotRoutes";
import authRoutes from "./routes/authRoutes";
import cookieParser from "cookie-parser";
import compression from "compression";
import dotenv from "dotenv";
dotenv.config();

const PORT = parseInt(process.env.SERVER_PORT || "3000", 10);

const app: Application = express();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.ensureDirSync(UPLOAD_DIR);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
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
