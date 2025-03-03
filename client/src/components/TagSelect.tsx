import { useFormContext } from "../context/FormContext";

const tags = [
  "E-Commerce",
  "Portfolio",
  "Blog",
  "Restaurant",
  "Education",
  "Healthcare",
  "Travel",
  "Real Estate",
];

export function TagSelect() {
  const { formData, setFormData } = useFormContext();

  if (formData.newTag && formData.newTag?.length > 0 ) return null; // Hide if newTag is used

  return (
    <div className="flex items-center gap-2 mt-4">
      <select
        name="tag"
        className="border-2 rounded-md px-4"
        value={formData.tag}
        onChange={(e) => setFormData({ tag: e.target.value })}
      >
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="rounded-md bg-gray-300 cursor-pointer grow px-4"
      >
        Save
      </button>
    </div>
  );
}