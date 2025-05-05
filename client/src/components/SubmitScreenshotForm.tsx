import { useFormContext } from "../context/FormContext";
import { TagSelect } from "./TagSelect";

interface SubmitScreenshotFormProps {
  setScreenshotUploaded: (uploaded: boolean) => void;
}

function SubmitScreenshotForm({
  setScreenshotUploaded,
}: SubmitScreenshotFormProps) {
  const { formData, setFormLoading } = useFormContext();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);

    chrome.runtime.sendMessage(
      { action: "upload_screenshot", data: formData },
      async (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error sending message:",
            chrome.runtime.lastError.message
          );
          setFormLoading(false);
          return;
        }
        if (response && response.success) {
          const [tab] = await chrome.tabs.query({
            active: true,
            lastFocusedWindow: true,
          });
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
        setFormLoading(false);
      }
    );

    // For development purposes
    console.log("Form Submitted:", formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <TagSelect />
      <button
        type="submit"
        className="rounded-md bg-black text-white cursor-pointer py-4 w-full mt-4"
      >
        Save
      </button>
    </form>
  );
}

export default SubmitScreenshotForm;
