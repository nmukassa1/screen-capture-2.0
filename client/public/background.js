chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture_screenshot") {
        console.log("Capturing screenshot...");

        chrome.tabs.captureVisibleTab({ format: "png" }, (imageData) => {
            if (!imageData) {
                sendResponse({ success: false, error: "Failed to capture screenshot" });
                return;
            }
            sendResponse({ success: true, screenshot: imageData });
        });
        return true;
    }

    if (message.action === "upload_screenshot") {
        console.log("Uploading screenshot...");
        uploadScreenshot(message.screenshot)
            .then(sendResponse) // Properly handle the async response
            .catch((err) => sendResponse({ success: false, error: err.message }));

        return true; // Ensures sendResponse is handled asynchronously
    }
});

async function uploadScreenshot(imageData) {
    try {
        // Make the API request and wait for the response
        const response = await fetch("http://localhost:3000/api/screenshot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ screenshot: imageData }),
        });
        const data = await response.json();

       return data;
    } catch (err) {
        console.error(err);
        return { success: false, error: err.message };
    }
 }

function captureScreenshot() {
    return new Promise((resolve) => {
        chrome.tabs.captureVisibleTab({ format: "png" }, (imageData) => {
            if (!imageData) {
                resolve({ success: false, error: "Failed to capture screenshot" });
            } else {
                resolve({ success: true, screenshot: imageData });
            }
        });
    });
}

