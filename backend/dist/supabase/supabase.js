"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseSERVICE = exports.supabase = void 0;
exports.createUserClient = createUserClient;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from backend root — not from cwd (nodemon from monorepo root would skip backend/.env)
const backendRoot = path_1.default.resolve(__dirname, "../..");
dotenv_1.default.config({ path: path_1.default.join(backendRoot, ".env") });
dotenv_1.default.config({ path: path_1.default.join(backendRoot, ".env.local"), override: true });
const supabaseUrl = process.env.SUPABASE_URL || "";
// Supabase dashboard calls this the "anon" / "public" key; support both names
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
/** Only set when `SUPABASE_SERVICE_ROLE_KEY` is present. Used for admin APIs (e.g. delete user). */
exports.supabaseSERVICE = supabaseServiceRoleKey
    ? (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey)
    : null;
function createUserClient(sessionKey) {
    return (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${sessionKey}`,
            },
        },
    });
}
