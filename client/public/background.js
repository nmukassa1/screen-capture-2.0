chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture_screenshot") {
        console.log("Capturing screenshot...");
        chrome.tabs.captureVisibleTab(null, { format: "png" }, async (imageData) => {
            if (chrome.runtime.lastError) {
                console.error("Error capturing screenshot:", chrome.runtime.lastError.message);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }
            if (!imageData) {
                console.error("Failed to capture screenshot: No image data returned.");
                sendResponse({ success: false, error: "Failed to capture screenshot" });
                return;
            }
            
            ////

            // let tabUrl;

            const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
            const tabName = extractTabName(tab.url);
            console.log("Tab url: ", tabName);
            
            chrome.scripting.executeScript({
                args: [tab.url, tabName],
                target: { tabId: tab.id },
                func: (tabUrl, tabName) => {
                    console.log("Tab url: ", tabUrl);
                    console.log("Tab name: ", tabName);
                },
            });
        
            console.log("Screenshot captured successfully.");
            sendResponse({ success: true, screenshot: imageData, tabName: tabName, tabUrl: tab.url});
        });
        return true; // Keep the message channel open for async response
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

function extractTabName(url){
    // use this as refference https://www.google.com
    // this function will return google
    return new URL(url).hostname.split('.')[1];
}