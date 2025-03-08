import { useFormContext } from "../context/FormContext";
// import { useEffect, useState } from "react";
// import { api } from "../api/api";
import { Tag } from "../types";
import { useTagsContext } from "../context/TagsContext";

// const tags = [
//   "E-Commerce",
//   "Portfolio",
//   "Blog",
//   "Restaurant",
//   "Education",
//   "Healthcare",
//   "Travel",
//   "Real Estate",
// ];

export function TagSelect() {
  const { formData, setFormData } = useFormContext();
  const { tags } = useTagsContext();
  // const [tags, setTags] = useState<Tag[]>([]);
  // useEffect(() => {
    
  //     async function getTags() {
  //       const response = await api.get("/tags/1");
  //       console.log("Tags:", response.data);
  //       setTags(response.data);
  //     }

  //     getTags();
   
  // }, [])

  if (tags && tags.length === 0 ) return null; 

  return (
    <>
      {tags.map((tag: Tag) => (
        <div key={tag.id} className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            name="tagIds"
            value={tag.id}
            id={tag.id.toString()}
            // checked={formData.tagIds?.includes(tag.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setFormData({
                  tagIds: [...(formData.tagIds || []), tag.id],
                });
              } else {
                setFormData({
                  tagIds: formData.tagIds?.filter((id) => id !== tag.id),
                });
              }
            }}
          />
          <label htmlFor={tag.id.toString()}>{tag.name}</label>
        </div>
      ))}
    </>
  );
}