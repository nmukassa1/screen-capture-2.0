import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { FormDataType, ScreenshotResponse } from "../types";

interface FormProviderProps {
  children: ReactNode;
  screenshotResponse: ScreenshotResponse;
}

interface FormContextType {
  formData: FormDataType;
  // setFormData: (update: Partial<FormDataType>) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children, screenshotResponse }: FormProviderProps) {
  

  
  const [formData, setFormDataState] = useState<FormDataType>({
    ...Object.fromEntries(Object.entries(screenshotResponse).filter(([key]) => key !== "success")),
    tagIds: [7],
    userId: "1",
  });

  useEffect(() => {
    // Remove success key from screenshotResponse submited via chrome api
    setFormDataState((prev) => ({
      ...prev,
      ...Object.fromEntries(Object.entries(screenshotResponse).filter(([key]) => key !== "success")),
    }));
  }, [screenshotResponse]);

  // const setFormData = (update: Partial<FormDataType>) => {
  //   setFormDataState((prev) => {
  //     const updatedForm = { ...prev, ...update };
  //     console.log(update.newTag?.trim().length);
      
  //     if (update.newTag !== undefined) {
  //       if (update.newTag.length > 0) {
  //           // If newTag is set, remove tag
  //           delete updatedForm.tag;
  //       } else {
  //           delete updatedForm.newTag;
  //           updatedForm.tag = prev.tag || "E-Commerce"; // Restore default tag if empty
  //       }
  //     }


  //     console.log("Updated Form Data:", updatedForm);
      
  //     return updatedForm;
  //   });
  // };

  return (
    <FormContext.Provider value={{ formData }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}