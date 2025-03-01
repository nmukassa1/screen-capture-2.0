chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture_screenshot") {
        chrome.tabs.captureVisibleTab({ format: "png" }, async (imageData) => {
            if (!imageData) {
                sendResponse({ success: false, error: "Failed to capture screenshot" });
                return;
            }

            try {
                // Make the API request and wait for the response
                const response = await fetch("http://localhost:3000/api/screenshot", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ screenshot: imageData }),
                });
                const data = await response.json();

                // Send back the screenshot and API response
                sendResponse({ success: true, response: data });
            } catch (err) {
                console.error(err);
                sendResponse({ success: false, error: err.message });
            }
        });

        // Must return true to allow async `sendResponse`
        return true;
    }
});