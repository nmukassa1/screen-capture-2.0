import { ImagePreview } from "./ImagePreview";
import { CreateTagForm } from "./CreateTagForm";
import { useFormContext } from "../context/FormContext";
import SubmitScreenshotForm from "./SubmitScreenshotForm";
import { TagsProvider } from "../context/TagsContext";
import Spinner from "./Spinner";

interface FormProps {
  setScreenshotUploaded: (uploaded: boolean) => void;
}

function Form({ setScreenshotUploaded }: FormProps) {
  const { formData, formLoading } = useFormContext();

  return (
    <TagsProvider>
      {formLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          <ImagePreview />
          <h2 className="text-foreground text-lg font-semibold">
            {formData.siteName
              ? formData.siteName.charAt(0).toUpperCase() +
                formData.siteName.slice(1)
              : "No Site Name"}
          </h2>
          <CreateTagForm />
          <SubmitScreenshotForm setScreenshotUploaded={setScreenshotUploaded} />
        </div>
      )}
    </TagsProvider>
  );
}

export default Form;
