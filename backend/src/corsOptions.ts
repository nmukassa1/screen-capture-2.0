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

/**
 * Browser dashboard + Chrome extension (`chrome-extension://…`) origins.
 * Echoes the request `Origin` when allowed so `credentials: true` works.
 */
export function buildCorsOptions(): CorsOptions {
  const allowList = new Set([...DEFAULT_ORIGINS, ...originsFromEnv()]);

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowList.has(origin)) {
        callback(null, origin);
        return;
      }
      if (origin.startsWith("chrome-extension://")) {
        callback(null, origin);
        return;
      }
      callback(null, false);
    },
  };
}
