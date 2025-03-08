import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Tag } from "../types";
import { api } from "../api/api";

interface TagsContextType{
    tags: Tag[];
    setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

const tagContext = createContext<TagsContextType | undefined>(undefined);

export const TagsProvider = ({children} : {children: ReactNode}) => {
    const [tags, setTags] = useState<Tag[]>([]);

    useEffect(() => {
        async function getTags() {
          const response = await api.get("/tags/1");
          console.log("Tags:", response.data);
          setTags(response.data);
        }
  
        getTags();
     
    }, [])

    return (
        <tagContext.Provider value={{tags, setTags}}>
            {children}
        </tagContext.Provider>
    )
}

export const useTagsContext = () => {
    const context = useContext(tagContext);
    if(context === undefined){
        throw new Error("useTagsContext must be used within a TagsProvider");
    }
    return context
}