// import { useFormContext } from "../context/FormContext";

interface FormData {
  name: string;
  userId: string;
}

import { useState } from "react";
// import { api } from "../api/api";
import { useTagsContext } from "../context/TagsContext";
import { Tag } from "../types";
import { useUserContext } from "../context/UserContext";
import { LoaderIcon } from "lucide-react";

export function CreateTagForm() {
  const { setTags } = useTagsContext();
  const { user } = useUserContext();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    userId: user?.id || "1",
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      chrome.runtime.sendMessage(
        {
          action: "create_tag",
          payload: formData,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            throw new Error(chrome.runtime.lastError.message);
          }

          if (!response.success) {
            throw new Error(response.error || "Tag creation failed");
          }

          console.log("Tag created:", response.tag);
          setTags((prev: Tag[]) => [...prev, response.tag]);
          setFormData({ name: "", userId: user?.id || "1" });
        }
      );
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Create Tag (optional)"
          className="border-2 rounded-md px-4 grow"
          name="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <button
          type="submit"
          className={`w-[30px] h-[30px] rounded-full border-2 border-black  grid place-content-center ${
            !formData.name ? "cursor-not-allowed" : "cursor-pointer"
          }`}
          disabled={!formData.name}
        >
          +
        </button>
      </form>
      {isLoading && (
        <div className="w-fit spinner mx-auto">
          <LoaderIcon />
        </div>
      )}
    </>
  );
}
