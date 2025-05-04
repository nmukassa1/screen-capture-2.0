import express, { Application, Request, Response } from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import fs from "fs-extra";
import path from "path";
import tagRoutes from "./routes/tagRoutes";
import screenshotRoutes from "./routes/screenshotRoutes";
import cookieParser from "cookie-parser";

const PORT = 3000;

const app: Application = express();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.ensureDirSync(UPLOAD_DIR);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json("Hello World");
});

app.use("/tags", tagRoutes);
app.use("/screenshots", screenshotRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
