import { useFormContext } from "../context/FormContext";
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

  if (tags && tags.length === 0 ) return null; 

  return (
    <div className="flex gap-x-2 gap-y-6 mt-4 flex-wrap">
      {tags.map((tag: Tag) => (
       <div key={tag.id}>
       <input
         type="checkbox"
         name="tagIds"
         value={tag.id}
         id={tag.id.toString()}
         className="hidden peer"
        //  checked={formData.tagIds?.includes(tag.id)}
         onChange={async (e) => {
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
       <label
         htmlFor={tag.id.toString()}
         className="cursor-pointer px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-700 
                   hover:bg-gray-200 peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 transition"
       >
         {tag.name}
       </label>
     </div>
      ))}
    </div>
  );
}