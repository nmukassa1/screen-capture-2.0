import { Request, Response } from "express";

/**
 * Ensures the JWT subject matches `claimedUserId` (from URL or body).
 * Sends 401/403 and returns false when the request must stop.
 */
export function ensureSameUser(
  req: Request,
  res: Response,
  claimedUserId: string | undefined
): boolean {
  const authId = req.authUser?.id;
  if (!authId) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  if (!claimedUserId || authId !== claimedUserId) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}
