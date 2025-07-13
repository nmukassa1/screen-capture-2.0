const apiEndpoint = "https://designspo-backend.onrender.com/";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "capture_screenshot") {
    console.log("Capturing screenshot...");
    captureScreenshot(sendResponse);
    return true; // Keep the message channel open for async response
  }

  if (message.action === "upload_screenshot") {
    console.log("Uploading screenshot...");
    console.log("Data: ", message.data);

    uploadScreenshot(message.data)
      .then((res) => {
        console.log("Response from server:", res);
        console.log("Screenshot uploaded successfully.");
        sendResponse({ success: true, data: res });
      })
      .catch((err) => {
        console.error("Error uploading screenshot:", err);
        sendResponse({ success: false, error: err.message });
      });

    return true; // Ensures sendResponse is handled asynchronously
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "login") {
      const { email, password } = message;

      fetch(apiEndpoint + "auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.error);
          }
          console.log("Login successful:", data);
          // Store user data in local storage
          chrome.storage.local.set(
            {
              user: JSON.stringify(data.user),
              session: JSON.stringify(data.session),
            },
            () => {
              console.log("User session saved successfully.");
            }
          );
          sendResponse({ success: true, user: data.user });
        })
        .catch((error) => {
          console.error("Login failed:", error);
          sendResponse({ success: false, error: error.message });
        });

      // 👇 Important to keep sendResponse alive
      return true;
    }
  });

  if (message.action === "login-error") {
    console.error("Login error:", message.error);
  }

  if (message.action === "logout") {
    console.log("Logged out!");
    fetch(apiEndpoint + "auth/logout", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        // Clear user data from local storage
        chrome.storage.local.remove(["user", "session"], () => {
          console.log("User session cleared successfully.");
        });
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        sendResponse({ success: false, error: error.message });
      });
  }

  if (message.action === "restore-session") {
    chrome.storage.local.get(["user", "session"], (result) => {
      const user = JSON.parse(result.user);
      const session = JSON.parse(result.session);
      console.log("Restoring session for user:", user);
      console.log("Session data:", session);

      sendResponse({ success: true, user, session });
    });
    return true;
  }
});

async function uploadScreenshot(formData) {
  try {
    // Make the API request and wait for the response
    const response = await fetch(apiEndpoint + "screenshots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await response.json();

    return data;
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

function captureScreenshot(sendResponse) {
  chrome.tabs.captureVisibleTab(null, { format: "png" }, async (imageData) => {
    if (chrome.runtime.lastError) {
      console.error(
        "Error capturing screenshot:",
        chrome.runtime.lastError.message
      );
      sendResponse({ success: false, error: chrome.runtime.lastError.message });
      return;
    }
    if (!imageData) {
      console.error("Failed to capture screenshot: No image data returned.");
      sendResponse({ success: false, error: "Failed to capture screenshot" });
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      if (!tab || !tab.url) {
        console.error("No active tab found or invalid URL.");
        sendResponse({ success: false, error: "No active tab found" });
        return;
      }

      const siteName = extractSiteName(tab.url);
      console.log("Tab URL:", tab.url);
      console.log("Site Name:", siteName);

      chrome.scripting.executeScript({
        args: [tab.url, siteName],
        target: { tabId: tab.id },
        func: (siteUrl, siteName) => {
          console.log("Tab URL:", siteUrl);
          console.log("Tab Name:", siteName);
        },
      });

      console.log("Screenshot captured successfully.");
      sendResponse({
        success: true,
        screenshot: imageData,
        siteName,
        siteUrl: tab.url,
      });
    } catch (error) {
      console.error("Error processing screenshot:", error.message);
      sendResponse({ success: false, error: error.message });
    }
  });
}

function extractSiteName(url) {
  try {
    let hostname = new URL(url).hostname;
    hostname = hostname.replace(/^www\./, ""); // Remove 'www.' if present
    return hostname.split(".")[0]; // Remove TLD and return only the main domain
  } catch (error) {
    console.error("Invalid URL:", url);
    return url; // Return the original URL if parsing fails
  }
}
