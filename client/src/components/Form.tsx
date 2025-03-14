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
        <div>
          <ImagePreview />
          <h2 className="font-bold text-lg mb-4">{formData.siteName ? (
            formData.siteName.charAt(0).toUpperCase() + formData.siteName.slice(1)
          ) : (
            "No Site Name"
          )}</h2>
          {/* <div className="w-full h-[1px] bg-gray-300 mt-2 mb-4"></div> */}
          <CreateTagForm />
          <SubmitScreenshotForm setScreenshotUploaded={setScreenshotUploaded}  />
        </div>
      )}
    </TagsProvider>
  );
}

export default Form;