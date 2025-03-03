import { useFormContext } from "../context/FormContext";

export function ImagePreview() {
  const { formData } = useFormContext();

  return (
    <div className="h-[200px] overflow-hidden mb-4">
      {formData.img ? (
        <img src={formData.img} alt="Captured screenshot" className="object-fill" />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          No Screenshot Available
        </div>
      )}
    </div>
  );
}