import type { User } from "@supabase/supabase-js";

/** Response shape for every popup -> background message. */
export type MessageResponse<T = undefined> =
  | ({ success: true } & (T extends undefined ? object : { data: T }))
  | { success: false; error: string; authRequired?: boolean };

/** Broadcast by the background worker whenever the session changes. */
export interface AuthStateChangedMessage {
  action: "auth_state_changed";
  user: User | null;
}

export function sendToBackground<T = undefined>(
  message: { action: string } & Record<string, unknown>,
): Promise<MessageResponse<T>> {
  return chrome.runtime.sendMessage(message);
}
