import type { CorsOptions } from "cors";

const DEFAULT_ORIGINS = [
  "https://app.designspo.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function originsFromEnv(): string[] {
  const raw = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "";
  if (!raw.trim()) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function extensionOriginsFromEnv(): string[] {
  const raw = process.env.EXTENSION_ID || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((id) => `chrome-extension://${id}`);
}

/**
 * Browser dashboard origins plus the Designspo extension (`EXTENSION_ID`).
 * Auth is bearer-only, so credentials (cookies) are not allowed cross-origin.
 */
export function buildCorsOptions(): CorsOptions {
  const extensionOrigins = extensionOriginsFromEnv();
  const allowList = new Set([
    ...DEFAULT_ORIGINS,
    ...originsFromEnv(),
    ...extensionOrigins,
  ]);

  if (extensionOrigins.length === 0) {
    console.warn("EXTENSION_ID is not set; the Chrome extension will be blocked by CORS");
  }

  return {
    origin(origin, callback) {
      // Non-browser clients (curl, server-to-server) send no Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, allowList.has(origin) ? origin : false);
    },
  };
}
