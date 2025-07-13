import express from "express";
import { supabase } from "../supabase/supabase";
import { authenticate } from "../middlewares/authenticate";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.error("Email and password are required");
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error);
    res.status(401).json({ error: error.message });
    return;
  }

  res.json({ session: data.session.access_token, user: data.user });
});

router.post("/logout", authenticate, async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: error.message });
    return;
  }
  console.log("User logged out successfully");
  res.status(200).json({ message: "Logged out successfully" });
  return;
});

export default router;
