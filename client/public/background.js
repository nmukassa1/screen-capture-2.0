// const apiEndpoint = "https://designspo-backend.onrender.com/";
const apiEndpoint = "http://localhost:4000/";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "capture_screenshot") {
    console.log("Capturing screenshot...");
    captureScreenshot(sendResponse);
    return true; // Keep the message channel open for async response
  }

  // if (message.action === "upload_screenshot") {
  //   // Get access token from local storage

  //   uploadScreenshot(message.data)
  //     .then((res) => {
  //       sendResponse({ success: true, data: res });
  //     })
  //     .catch((err) => {
  //       console.error("Error uploading screenshot:", err);
  //       sendResponse({ success: false, error: err.message });
  //     });

  //   return true; // Ensures sendResponse is handled asynchronously
  // }

  if (message.action === "upload_screenshot") {
    // Get access token from local storage
    getSession()
      .then(async (session) => {
        const result = await uploadScreenshot(message.data, session);

        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        console.error("Upload error:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Ensures sendResponse is handled asynchronously
  }

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

  if (message.action === "login-error") {
    console.error("Login error:", message.error);
  }

  if (message.action === "logout") {
    // Get session key
    getSession()
      .then((session) => {
        logout(session);
      })
      .catch((error) => {
        console.error("Error getting session:", error);
        sendResponse({ success: false, error: error.message });
      });
  }

  if (message.action === "restore-session") {
    chrome.storage.local.get(["user", "session"], (result) => {
      const user = JSON.parse(result.user);
      const session = JSON.parse(result.session);

      sendResponse({ success: true, user, session });
    });
    return true;
  }
});

// async function uploadScreenshot(formData) {
//   try {
//     // Make the API request and wait for the response
//     const response = await fetch(apiEndpoint + "screenshots", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(formData),
//     });
//     const data = await response.json();

//     return data;
//   } catch (err) {
//     console.error(err);
//     return { success: false, error: err.message };
//   }
// }

async function uploadScreenshot(formData, session) {
  try {
    const response = await fetch(apiEndpoint + "screenshots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session}`,
      },
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

function getSession() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("session", (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        const session = JSON.parse(result.session);
        resolve(session);
      }
    });
  });
}

function logout(session) {
  fetch(apiEndpoint + "auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session}`, // Include token for authentication
    },
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
