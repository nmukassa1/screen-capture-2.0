import { useState } from "react";

const ScreenshotButton = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);

  // useEffect(() => {
  //   // Load the last saved screenshot from storage
  //   chrome.storage.local.get("screenshot", (data) => {
  //     if (data.screenshot) {
  //       setScreenshot(data.screenshot);
  //     }
  //   });
  // }, []);

  async function logResponse(data: object) {
    // Query for the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript<object[], void>({
      target: { tabId: tab.id! },
      args: [data],
      func: (data) => {
        console.log(data);
      }
    })
  }

  const takeScreenshot = async () => {
    // Send a message to the background script to capture a screenshot
    chrome.runtime.sendMessage({ action: "capture_screenshot" }, (response) => {
      if (response && response.success) {
        setScreenshot(response.success);

        logResponse(response);
        
        chrome.storage.local.set({ screenshot: response.screenshot });
      } else {
        console.error("Failed to capture screenshot");
      }
    });
  };

  return (
    <div style={{ padding: 20, textAlign: "center", width: 250 }}>
      <h3>Screenshot Extension</h3>
      <button onClick={takeScreenshot}>Take Screenshot</button>
      {screenshot && (
        // <img src={screenshot} alt="Screenshot" style={{ width: "100%", marginTop: 10 }} />
        <p>Screenshot captured</p>
      )}
    </div>
  );
};

export default ScreenshotButton;