import { TRUSTED_WEB_ORIGINS } from "../config";
import type { MessageResponse } from "../messages";
import type { FormDataType, Tag } from "../types";
import {
  AuthRequiredError,
  apiFetch,
  connectWithTokenHash,
  getCurrentUser,
  signOutLocal,
} from "./auth";

type SendResponse = (response: MessageResponse<unknown>) => void;

/** Resolves `work` into a MessageResponse. Returns true to keep the channel open. */
function respond(sendResponse: SendResponse, work: () => Promise<unknown>): true {
  work()
    .then((data) => sendResponse({ success: true, data }))
    .catch((error: unknown) =>
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        authRequired: error instanceof AuthRequiredError,
      }),
    );
  return true;
}

chrome.runtime.onInstalled.addListener(() => {
  // Credentials from the pre-SSO version, which stored a bare access token.
  chrome.storage.local.remove(["user", "session"]);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return;

  switch (message?.action) {
    case "capture_screenshot":
      captureScreenshot(sendResponse);
      return true;

    case "get_user":
      return respond(sendResponse, getCurrentUser);

    case "get_tags":
      return respond(sendResponse, () =>
        apiFetch<Tag[]>(`/tags/${encodeURIComponent(message.userId)}`),
      );

    case "create_tag":
      return respond(sendResponse, () =>
        apiFetch<Tag>("/tags", {
          method: "POST",
          body: { name: message.payload.name, userId: message.payload.userId },
        }),
      );

    case "upload_screenshot":
      return respond(sendResponse, () =>
        apiFetch("/screenshots", {
          method: "POST",
          body: message.data as FormDataType,
        }),
      );

    case "logout":
      return respond(sendResponse, signOutLocal);
  }
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (!sender.origin || !TRUSTED_WEB_ORIGINS.has(sender.origin)) {
    sendResponse({ success: false, error: "Untrusted origin" });
    return;
  }

  switch (message?.action) {
    case "connect": {
      const tokenHash = message.token_hash;
      if (typeof tokenHash !== "string" || !tokenHash) {
        sendResponse({ success: false, error: "Missing token_hash" });
        return;
      }
      return respond(sendResponse, () => connectWithTokenHash(tokenHash));
    }

    case "sign_out":
      return respond(sendResponse, signOutLocal);

    default:
      sendResponse({ success: false, error: "Unknown action" });
  }
});

function captureScreenshot(sendResponse: (response: unknown) => void) {
  chrome.tabs.captureVisibleTab({ format: "png" }, async (imageData) => {
    if (chrome.runtime.lastError) {
      sendResponse({ success: false, error: chrome.runtime.lastError.message });
      return;
    }
    if (!imageData) {
      sendResponse({ success: false, error: "Failed to capture screenshot" });
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      if (!tab?.url) {
        sendResponse({ success: false, error: "No active tab found" });
        return;
      }

      sendResponse({
        success: true,
        screenshot: imageData,
        siteName: extractSiteName(tab.url),
        siteUrl: tab.url,
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

function extractSiteName(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname.split(".")[0];
  } catch {
    return url;
  }
}
