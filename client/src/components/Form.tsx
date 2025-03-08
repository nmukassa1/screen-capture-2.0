import { ImagePreview } from "./ImagePreview";
import { CreateTagForm } from "./CreateTagForm";
import { useFormContext } from "../context/FormContext";
import SubmitScreenshotForm from "./SubmitScreenshotForm";
import { TagsProvider } from "../context/TagsContext";

interface FormProps {
  setScreenshotUploaded: (uploaded: boolean) => void;
}

function Form({ setScreenshotUploaded }: FormProps) {
  const { formData } = useFormContext();

  return (
    <TagsProvider>
      <div>
        <ImagePreview />
        <h2 className="font-bold text-lg">{formData.siteName || "Example"}</h2>

        <CreateTagForm />
        <SubmitScreenshotForm setScreenshotUploaded={setScreenshotUploaded}  />
      </div>
    </TagsProvider>
  );
}

export default Form;