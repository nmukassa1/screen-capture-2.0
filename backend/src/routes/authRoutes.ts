import express from "express";
import { supabase, supabaseSERVICE } from "../supabase/supabase";
import { authenticate } from "../middlewares/authenticate";
import prisma from "../prisma";

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

router.delete("/delete-account/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  if (!req.authUser || id !== req.authUser.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (!supabaseSERVICE) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
    res.status(503).json({
      error:
        "Account deletion is not configured on this server (missing service role key).",
    });
    return;
  }

  // Delete user from Supabase Auth
  const { error: authError } = await supabaseSERVICE.auth.admin.deleteUser(id);
  if (authError) {
    console.error("Delete account error:", authError);
    res.status(500).json({ error: authError.message });
    return;
  }

  try {
    //Delete users SCREENSHOTS in DB using prisma
    await prisma.screenshot.deleteMany({
      where: { userId: id },
    });

    await prisma.tag.deleteMany({
      where: { userId: id },
    });
    //Delete files from STORAGE
    const { error: storageError } = await supabaseSERVICE.storage
      .from("screenshots")
      .remove([`${id}`]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      throw new Error(storageError.message);
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to delete user data" });
    return;
  }

  res.status(200).json({ message: "Account deleted successfully" });
});

export default router;
