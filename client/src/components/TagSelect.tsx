import { useFormContext } from "../context/FormContext";
import { FormDataType, Tag } from "../types";
import { useTagsContext } from "../context/TagsContext";
// import Spinner from "./Spinner";
import { LoaderIcon } from "lucide-react";

export function TagSelect() {
  const { formData, setFormData } = useFormContext();
  const { tags, isLoading } = useTagsContext();

  // if (!tags || tags.length === 0) return null;

  if (isLoading) {
    return (
      <div className="w-fit spinner mx-auto">
        <LoaderIcon />
      </div>
    );
  }

  if (tags.length > 0) {
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

  return (
    <div className="flex flex-col gap-y-[24px] py-4 mt-4 overflow-x-auto">
      <div className="flex gap-x-2">
        <p className="text-center text-gray-500">No tags created</p>
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
        className="cursor-pointer px-4 py-2 rounded-md border border-black text-black
                 hover:bg-black hover:text-white peer-checked:bg-black peer-checked:text-white transition"
      >
        {tag.name}
      </label>
    </div>
  );
}
