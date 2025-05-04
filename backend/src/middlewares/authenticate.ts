import jwt from "jsonwebtoken";
import { supabase } from "../supabase/supabase";
import dotenv from "dotenv";
dotenv.config();

// If you prefer verifying manually without supabase-js
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET; // Find this in Supabase settings

import { Request, Response, NextFunction } from "express";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.["sb-tpuqajccekhicnmlosod-auth-token"];

  if (!token) {
    res.status(401).json({ error: "No token" });
  }

  try {
    if (!SUPABASE_JWT_SECRET) {
      throw new Error("SUPABASE_JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
    console.log("Decoded token:", decoded);

    // req.user = decoded; // Now req.user has the user's info
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}
