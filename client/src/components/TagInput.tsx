import { useFormContext } from "../context/FormContext";

export function TagInput() {
  const { formData, setFormData } = useFormContext();

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Create Tag (optional)"
        className="border-2 rounded-md px-4 grow"
        name="newTag"
        value={formData.newTag ?? ""} 
        onChange={(e) => setFormData({ newTag: e.target.value })}
      />
      <button
        type="submit"
        className={`w-[30px] h-[30px] rounded-full bg-gray-300 grid place-content-center ${!formData.newTag ? "cursor-not-allowed" : "cursor-pointer"}`}  
        disabled={!formData.newTag}
      >
        +
      </button>
    </div>
  );
}