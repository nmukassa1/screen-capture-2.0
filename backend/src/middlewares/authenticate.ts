import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase/supabase";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let token = req.headers.authorization;
  // Extract the token from the Authorization header
  token = token && token.replace("Bearer ", "");

  console.log("Authenticating user with token:", token);

  if (!token) {
    console.error("No authentication token provided");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  supabase.auth
    .getUser(token)

    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching user:", error);
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      next();
    })

    .catch((err) => {
      console.error("Authentication error:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    });
};
