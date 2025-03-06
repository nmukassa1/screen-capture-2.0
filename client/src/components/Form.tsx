import { ImagePreview } from "./ImagePreview";
import { TagInput } from "./TagInput";
import { TagSelect } from "./TagSelect";
import { useFormContext } from "../context/FormContext";

interface FormProps {
  setScreenshotUploaded: (uploaded: boolean) => void;
}

function Form({ setScreenshotUploaded }: FormProps) {
  const { formData } = useFormContext();

  // Temporary function to handle form submission in development
  // setScreenshotUploaded(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // chrome.scripting.executeScript({
    //   target: { tabId: tab.id! },
    //   args: [formData],
    //   func: (formData) => {
    //     console.log('Form Submitted: ', formData);
        
    //   },
    // });

    chrome.runtime.sendMessage({ action: "upload_screenshot", data: formData }, async (response) => {
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
            console.log("Form response:", response);
          },
        });
        setScreenshotUploaded(true);
      } else {
        console.error("Error:", response);
      }
    });
    
    // For development purposes
    console.log("Form Submitted:", formData);
  }

  return (
    <div>
      <ImagePreview />
      <h2 className="font-bold text-lg">{formData.tabName || "Example"}</h2>
      <form onSubmit={handleSubmit}>
        <TagInput />
        <TagSelect />
      </form>
    </div>
  );
}

export default Form;