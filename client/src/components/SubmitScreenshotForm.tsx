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
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-muted-foreground mb-1 text-xs font-medium tracking-[0.16em] uppercase">
        Add to Collection
      </p>
      <TagSelect />
      <button
        type="submit"
        className="mt-3 w-full cursor-pointer rounded-xl bg-primary py-3 font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        Save
      </button>
    </form>
  );
}

export default SubmitScreenshotForm;
