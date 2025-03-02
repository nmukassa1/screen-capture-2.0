
const ScreenshotButton = ({setScreenshotCaptured} : {setScreenshotCaptured: (uploaded: boolean) => void}) => {
 
  const takeScreenshot = async () => {
    // Send a message to the background script to capture a screenshot
    chrome.runtime.sendMessage({ action: "capture_screenshot" }, (response) => {
      if (response && response.success) {
        console.log(response);
        
        setScreenshotCaptured(response.success);
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