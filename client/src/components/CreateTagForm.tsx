// import { useFormContext } from "../context/FormContext";

interface FormData {
  name: string;
  userId: string;
}

import { useState } from "react";
import { api } from "../api/api";
import { useTagsContext } from "../context/TagsContext";
import { Tag } from "../types";
import { useUserContext } from "../context/UserContext";

export function CreateTagForm() {
  const { setTags } = useTagsContext();
  const { user } = useUserContext();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    userId: user?.id || "1",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const response = await api.post("/tags", formData);
      if (response.status === 400) {
        throw new Error("Validation failed");
      }
      console.log("Tag created:", response.data);
      setTags((prev: Tag[]) => [...prev, response.data]);
      setFormData({ name: "", userId: user?.id || "1" });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
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
  );
}
