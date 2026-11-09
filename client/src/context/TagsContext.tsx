import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Tag } from "../types";
import { useUserContext } from "./UserContext";
import { sendToBackground } from "../messages";

interface TagsContextType {
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  isLoading: boolean;
}

const tagContext = createContext<TagsContextType | undefined>(undefined);

export const TagsProvider = ({ children }: { children: ReactNode }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useUserContext();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    sendToBackground<Tag[]>({ action: "get_tags", userId })
      .then((response) => {
        if (response.success) {
          setTags(response.data);
        } else {
          console.error("Failed to load tags:", response.error);
        }
      })
      .finally(() => setIsLoading(false));
  }, [userId]);

  return (
    <tagContext.Provider value={{ tags, setTags, isLoading }}>
      {children}
    </tagContext.Provider>
  );
};

export const useTagsContext = () => {
  const context = useContext(tagContext);
  if (context === undefined) {
    throw new Error("useTagsContext must be used within a TagsProvider");
  }
  return context;
};
