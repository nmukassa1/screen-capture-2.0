import express from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseSERVICE } from "../supabase/supabase";
import { authenticate } from "../middlewares/authenticate";
import prisma from "../prisma";

const router = express.Router();

/**
 * Issues a one-time magic-link token hash for the authenticated user. The
 * extension exchanges it via `verifyOtp({ token_hash, type: "magiclink" })`
 * for its own independent session.
 */
router.post("/extension-token", authenticate, async (req, res) => {
  const email = req.authUser?.email;
  if (!email) {
    res.status(400).json({ error: "Account has no email address" });
    return;
  }

  if (!supabaseSERVICE) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
    res.status(503).json({
      error:
        "Extension sign-in is not configured on this server (missing service role key).",
    });
    return;
  }

  const { data, error } = await supabaseSERVICE.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error || !data.properties?.hashed_token) {
    console.error("Extension token error:", error?.message);
    res.status(500).json({ error: "Failed to issue extension token" });
    return;
  }

  res.set("Cache-Control", "no-store");
  res.status(200).json({ token_hash: data.properties.hashed_token });
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

  // The auth user is deleted last so a failed cleanup can be retried by the
  // still-existing account.
  try {
    await removeUserScreenshotFiles(supabaseSERVICE, id);
  } catch (error) {
    console.error("Storage deletion error:", error);
    res.status(500).json({ error: "Failed to delete screenshot files" });
    return;
  }

  try {
    await prisma.$transaction([
      prisma.screenshot.deleteMany({ where: { userId: id } }),
      prisma.tag.deleteMany({ where: { userId: id } }),
    ]);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to delete user data" });
    return;
  }

  const { error: authError } = await supabaseSERVICE.auth.admin.deleteUser(id);
  if (authError) {
    console.error("Delete account error:", authError);
    res.status(500).json({ error: authError.message });
    return;
  }

  res.status(200).json({ message: "Account deleted successfully" });
});

const STORAGE_BATCH_SIZE = 100;

/** Removes every object under `${userId}/` in the screenshots bucket. */
async function removeUserScreenshotFiles(
  client: SupabaseClient,
  userId: string,
): Promise<void> {
  const bucket = client.storage.from("screenshots");

  // Always list from offset 0: each pass deletes what the previous one listed.
  for (;;) {
    const { data: files, error: listError } = await bucket.list(userId, {
      limit: STORAGE_BATCH_SIZE,
    });
    if (listError) throw listError;
    if (!files || files.length === 0) return;

    const { data: removed, error: removeError } = await bucket.remove(
      files.map((file) => `${userId}/${file.name}`),
    );
    if (removeError) throw removeError;
    if (!removed || removed.length === 0) {
      throw new Error("Storage reported no files removed");
    }

    if (files.length < STORAGE_BATCH_SIZE) return;
  }
}

export default router;
