import express from "express";
import { supabase } from "../supabase/supabase";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  console.log("Login attempt with email:", email);

  //   const { data, error } = await supabase.auth.signInWithPassword({
  //     email,
  //     password,
  //   });

  //   if (error) {
  //     res.status(401).json({ error: error.message });
  //     return;
  //   }

  //   // Store session in local storage or cookie
  //   res.cookie("session", JSON.stringify(data.session), {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV === "production",
  //     maxAge: 60 * 60 * 1000, // 1 hour
  //   });

  //   res.json(data);
});

export default router;
