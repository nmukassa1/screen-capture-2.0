"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureSameUser = ensureSameUser;
/**
 * Ensures the JWT subject matches `claimedUserId` (from URL or body).
 * Sends 401/403 and returns false when the request must stop.
 */
function ensureSameUser(req, res, claimedUserId) {
    var _a;
    const authId = (_a = req.authUser) === null || _a === void 0 ? void 0 : _a.id;
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
