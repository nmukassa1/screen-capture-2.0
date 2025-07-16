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

  // Delete user from Supabase Auth
  const { error: authError } = await supabaseSERVICE.auth.admin.deleteUser(id);
  if (authError) {
    console.error("Delete account error:", authError);
    res.status(500).json({ error: authError.message });
    return;
  }

  try {
    //Delete users SCREENSHOTS in DB using prisma
    const screenshotDeleteResult = await prisma.screenshot.deleteMany({
      where: { userId: id },
    });

    if (!screenshotDeleteResult) {
      throw new Error(screenshotDeleteResult);
    }
    //Delete users TAGS in DB
    const tagDeleteResult = await prisma.tag.deleteMany({
      where: { userId: id },
    });

    if (!tagDeleteResult) {
      throw new Error(tagDeleteResult);
    }
    //Delete files from STORAGE
    // const { error: storageError } = await supabaseSERVICE.storage
    //   .from("screenshots")
    //   .remove([`public/${id}`]);

    // if (storageError) {
    //   console.error("Storage deletion error:", storageError);
    //   throw new Error(storageError.message);
    // }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to delete user data" });
    return;
  }

  res.status(200).json({ message: "Account deleted successfully" });
});

export default router;
