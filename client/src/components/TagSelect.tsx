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
      <div className="spinner text-muted-foreground mx-auto w-fit py-2">
        <LoaderIcon size={18} />
      </div>
    );
  }

  if (tags.length > 0) {
    return (
      <div className="mt-2 space-y-3 overflow-x-auto py-3">
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
    <div className="mt-2 flex flex-col gap-y-2 overflow-x-auto py-3">
      <div className="flex gap-x-2">
        <p className="text-muted-foreground text-sm">No tags created yet</p>
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
        className="cursor-pointer rounded-full border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition
                 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary/40 peer-checked:bg-primary/15 peer-checked:text-foreground"
      >
        {tag.name}
      </label>
    </div>
  );
}
