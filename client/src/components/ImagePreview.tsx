import { useFormContext } from "../context/FormContext";

export function ImagePreview() {
  const { formData } = useFormContext();

  return (
    <div className=" overflow-hidden mb-2 shadow-md overflow-hidden rounded-md">
      {formData.image ? (
        <img src={formData.image} alt="Captured screenshot" className="object-fill" />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          No Screenshot Available
        </div>
      )}
    </div>
  );
}