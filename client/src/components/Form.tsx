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
    
    console.log("Form Submitted:", formData);
    setScreenshotUploaded(true);
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