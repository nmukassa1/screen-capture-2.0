import { useFormContext } from "../context/FormContext";
import { FormDataType, Tag } from "../types";
import { useTagsContext } from "../context/TagsContext";

export function TagSelect() {
  const { formData, setFormData } = useFormContext();
  const { tags } = useTagsContext();

  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-col gap-y-[24px] py-4 mt-4 overflow-x-auto">
      {/* Row 1 */}
      <div className="flex gap-x-2">
        {tags
          .filter((_, index) => index % 2 === 0)
          .map((tag) => (
            <TagItem
              key={tag.id}
              tag={tag}
              formData={formData}
              setFormData={setFormData}
            />
          ))}
      </div>

      {/* Row 2 */}
      <div className="flex gap-x-2">
        {tags
          .filter((_, index) => index % 2 !== 0)
          .map((tag) => (
            <TagItem
              key={tag.id}
              tag={tag}
              formData={formData}
              setFormData={setFormData}
            />
          ))}
      </div>
    </div>
  );
}

// Extracted TagItem component for cleaner code
function TagItem({
  tag,
  formData,
  setFormData,
}: {
  tag: Tag;
  formData: FormDataType;
  setFormData: (update: Partial<FormDataType>) => void;
}) {
  return (
    <div className="shrink-0">
      <input
        type="checkbox"
        name="tagIds"
        value={tag.id}
        id={tag.id.toString()}
        className="hidden peer"
        onChange={(e) => {
          const updatedTagIds = e.target.checked
            ? [...(formData.tagIds || []), Number(tag.id)]
            : (formData.tagIds || []).filter((id) => id !== Number(tag.id));

          setFormData({
            ...formData,
            tagIds: updatedTagIds,
          });
        }}
      />
      <label
        htmlFor={tag.id.toString()}
        className="cursor-pointer px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 
                 hover:bg-gray-200 peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 transition"
      >
        {tag.name}
      </label>
    </div>
  );
}
