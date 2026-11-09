import { useFormContext } from "../context/FormContext";
import { TagSelect } from "./TagSelect";
import { sendToBackground } from "../messages";

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

    try {
      const response = await sendToBackground({
        action: "upload_screenshot",
        data: formData,
      });
      if (response.success) {
        setScreenshotUploaded(true);
      } else {
        console.error("Upload failed:", response.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setFormLoading(false);
    }
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
