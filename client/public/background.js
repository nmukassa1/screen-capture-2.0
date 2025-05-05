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
        try {
          const data = JSON.parse(res); // Ensure parsing is safe
          console.log("Response from server:", data);
          console.log("Screenshot uploaded successfully.");
          sendResponse({ success: true });
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          sendResponse({
            success: false,
            error: "Invalid JSON response from server",
          });
        }
      })
      .catch((err) => {
        console.error("Error uploading screenshot:", err);
        sendResponse({ success: false, error: err.message });
      });

    return true; // Ensures sendResponse is handled asynchronously
  }

  //   if (message.action === "set_cookie") {
  //     console.log("Setting cookie...");
  //     console.log("Data: ", message.data);
  //     sendResponse({ success: true });
  //     return true;
  //   } else {
  //     console.log("Unknown action:", message.action);
  //   }
});

async function uploadScreenshot(formData) {
  try {
    // Make the API request and wait for the response
    const response = await fetch("http://localhost:3000/screenshots", {
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
