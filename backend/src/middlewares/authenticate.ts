import { Request, Response, NextFunction } from "express";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { supabase } from "../supabase/supabase";

/**
 * Verifies the bearer token with `getClaims`. With asymmetric JWT signing keys
 * enabled this is verified locally against the project's JWKS; with legacy
 * HS256 keys supabase-js falls back to a `getUser` network call.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : undefined;

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { data, error } = await supabase.auth.getClaims(token);

    if (isAuthRetryableFetchError(error)) {
      console.error("Authentication service unavailable:", error.message);
      res.status(503).json({ error: "Authentication service unavailable" });
      return;
    }

    const claims = data?.claims;
    if (error || !claims?.sub) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.authUser = { id: claims.sub, email: claims.email ?? null };
  } catch {
    // getClaims throws (rather than returns) for some invalid tokens, e.g. expired ones.
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  next();
};
