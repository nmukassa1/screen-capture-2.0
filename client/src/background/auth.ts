import {
  createClient,
  type SupportedStorage,
  type User,
} from "@supabase/supabase-js";
import { BACKEND_URL, SUPABASE_KEY, SUPABASE_URL } from "../config";
import type { AuthStateChangedMessage } from "../messages";

const STORAGE_KEY = "designspo-auth";

const chromeStorage: SupportedStorage = {
  async getItem(key) {
    const result = await chrome.storage.local.get(key);
    return (result[key] as string | undefined) ?? null;
  },
  async setItem(key, value) {
    await chrome.storage.local.set({ [key]: value });
  },
  async removeItem(key) {
    await chrome.storage.local.remove(key);
  },
};

// MV3 service workers are suspended when idle, so refresh timers are unreliable.
// getSession() refreshes an expired access token on demand instead.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: chromeStorage,
    storageKey: STORAGE_KEY,
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

function broadcastAuthState(user: User | null) {
  const message: AuthStateChangedMessage = { action: "auth_state_changed", user };
  // Rejects when no popup is open to receive it.
  chrome.runtime.sendMessage(message).catch(() => {});
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "INITIAL_SESSION") return;
  broadcastAuthState(session?.user ?? null);
});

export class AuthRequiredError extends Error {
  constructor() {
    super("Connect your Designspo account to continue");
    this.name = "AuthRequiredError";
  }
}

/** Returns a valid access token, refreshing it first if it has expired. */
export async function getAccessToken(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.user ?? null;
}

/** Exchanges a one-time magic-link token hash from the web app for a session of our own. */
export async function connectWithTokenHash(tokenHash: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });
  if (error || !data.session) {
    throw new Error(error?.message || "Could not connect the extension");
  }
  return { email: data.session.user.email ?? null };
}

/** Ends this device's session only. Local storage is cleared even if the revoke request fails. */
export async function signOutLocal(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (!error) return;

  const all = await chrome.storage.local.get(null);
  const authKeys = Object.keys(all).filter((key) => key.startsWith(STORAGE_KEY));
  await chrome.storage.local.remove(authKeys);
  broadcastAuthState(null);
}

interface ApiRequest {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

/** Calls the backend with the current access token. A 401 signs the extension out. */
export async function apiFetch<T>(path: string, request: ApiRequest = {}): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new AuthRequiredError();

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: request.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: request.body === undefined ? undefined : JSON.stringify(request.body),
  });

  if (response.status === 401) {
    await signOutLocal();
    throw new AuthRequiredError();
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      data?.error || data?.errorMessage || data?.message || `Request failed (${response.status})`,
    );
  }
  return data as T;
}
