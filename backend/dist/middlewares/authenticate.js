"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const supabase_1 = require("../supabase/supabase");
const authenticate = (req, res, next) => {
    let token = req.headers.authorization;
    // Extract the token from the Authorization header
    token = token && token.replace("Bearer ", "");
    if (!token) {
        console.error("No authentication token provided");
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    supabase_1.supabase.auth
        .getUser(token)
        .then(({ data, error }) => {
        if (error) {
            console.error("Error fetching user:", error);
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        const user = data.user;
        if (!(user === null || user === void 0 ? void 0 : user.id)) {
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
exports.authenticate = authenticate;
