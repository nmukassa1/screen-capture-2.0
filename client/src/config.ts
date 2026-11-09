const trimSlash = (url: string) => url.replace(/\/+$/, "");

export const BACKEND_URL = trimSlash(
  import.meta.env.VITE_BACKEND_URL || "https://screen-capture-2-0.vercel.app",
);

export const WEB_URL = trimSlash(
  import.meta.env.VITE_WEB_URL || "https://designspo-webpage.vercel.app",
);

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "";

/** Web origins allowed to sign the extension in or out via `onMessageExternal`. */
export const TRUSTED_WEB_ORIGINS = new Set([
  "https://designspo-webpage.vercel.app",
  "https://app.designspo.com",
  new URL(WEB_URL).origin,
]);
