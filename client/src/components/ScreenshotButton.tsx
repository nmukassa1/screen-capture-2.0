import { ScreenshotResponse } from "../types";

interface ScreenshotButtonProps { 
  setScreenshotCaptured: (screenshot: ScreenshotResponse) => void;
}

const ScreenshotButton = ({ setScreenshotCaptured }: ScreenshotButtonProps ) => {
 
  const takeScreenshot = () => {
    // Send a message to the background script to capture a screenshot
    chrome.runtime.sendMessage({ action: "capture_screenshot" }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError.message);
        return;
      }
      if (response && response.success) {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        chrome.scripting.executeScript({
          args: [response],
          target: { tabId: tab.id! },
          func: (response) => {
            console.log("Response received:", response);
          },
        });
        
        setScreenshotCaptured({
          image: response.screenshot, success: true, siteUrl: response.siteUrl, siteName: response.siteName
        });
      } else {
        console.error("Error:", response);
      }
    });
  };

  return (
    <div className="w-full bg-gray-300 overflow-hidden rounded-lg h-[200px]">
      <button onClick={takeScreenshot} className="w-full h-full grid place-content-center cursor-pointer">
        <img src="../assets/react.svg" alt="camera vector" /> 
      </button>
    </div>
  );
};

export default ScreenshotButton;