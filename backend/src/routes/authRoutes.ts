import express from "express";
import { supabase } from "../supabase/supabase";

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

router.get("/restore-session", async (req, res) => {
  // Retrieve session
  const { data, error } = await supabase.auth.getSession();
  // Not authenticated if no session
  if (error) {
    console.error("Error restoring session:", error);
    res.status(401).json({ error: error.message });
    return;
  }
  if (!data.session) {
    console.error("Session not found");
    res.status(401).json({ error: "Session not found" });
    return;
  }
  res.status(200).json({ user: data.session.user });
});

router.post("/logout", async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: error.message });
    return;
  }
  console.log("User logged out successfully");

  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
