"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseSERVICE = exports.supabase = void 0;
exports.createUserClient = createUserClient;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
exports.supabaseSERVICE = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey);
function createUserClient(sessionKey) {
    return (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${sessionKey}`,
            },
        },
    });
}
