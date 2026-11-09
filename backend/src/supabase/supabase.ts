import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load .env from backend root — not from cwd (nodemon from monorepo root would skip backend/.env)
const backendRoot = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(backendRoot, ".env") });
dotenv.config({ path: path.join(backendRoot, ".env.local"), override: true });

const supabaseUrl = process.env.SUPABASE_URL || "";
// Supabase dashboard calls this the "anon" / "public" key; support both names
const supabaseKey =
  process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Server clients are shared across requests, so they must never hold a session.
const serverAuthOptions = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: serverAuthOptions,
});

/** Only set when `SUPABASE_SERVICE_ROLE_KEY` is present. Used for admin APIs (e.g. delete user). */
export const supabaseSERVICE = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: serverAuthOptions,
    })
  : null;

export function createUserClient(sessionKey: string) {
  return createClient(supabaseUrl, supabaseKey, {
    auth: serverAuthOptions,
    global: {
      headers: {
        Authorization: `Bearer ${sessionKey}`,
      },
    },
  });
}
