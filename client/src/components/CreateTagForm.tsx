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
          className="placeholder:text-muted-foreground focus-visible:ring-ring/50 grow rounded-xl border border-border bg-card px-4 py-2.5 text-sm shadow-sm outline-none focus-visible:ring-[3px]"
          name="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <button
          type="submit"
          className={`grid h-9 w-9 place-content-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:scale-105 ${
            !formData.name
              ? "cursor-not-allowed opacity-40"
              : "cursor-pointer hover:opacity-90"
          }`}
          disabled={!formData.name}
        >
          +
        </button>
      </form>
      {isLoading && (
        <div className="spinner text-muted-foreground mx-auto w-fit pt-2">
          <LoaderIcon size={18} />
        </div>
      )}
    </>
  );
}
