import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseSERVICE = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

export function createUserClient(sessionKey: string) {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${sessionKey}`,
      },
    },
  });
}
