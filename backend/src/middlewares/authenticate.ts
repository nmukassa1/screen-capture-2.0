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

      const user = data.user;
      if (!user?.id) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      req.authUser = { id: user.id, email: user.email };
      next();
    })

    .catch((err) => {
      console.error("Authentication error:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    });
};
