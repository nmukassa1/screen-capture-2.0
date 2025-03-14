import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { FormDataType, ScreenshotResponse } from "../types";
import { User } from "@supabase/supabase-js";
import { logToConsoleViaExtension } from "../lib";

interface FormProviderProps {
  children: ReactNode;
  screenshotResponse: ScreenshotResponse;
  user: User;
}

interface FormContextType {
  formData: FormDataType;
  setFormData: (update: Partial<FormDataType>) => void;
  formLoading: boolean;
  setFormLoading: (loading: boolean) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children, screenshotResponse, user }: FormProviderProps) {
  

  
  const [formData, setFormDataState] = useState<FormDataType>({
    ...Object.fromEntries(Object.entries(screenshotResponse).filter(([key]) => key !== "success")),
    tagIds: [7],
    userId: user.id,
  });

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    async function x(){
     await  logToConsoleViaExtension(formLoading)

    }
    x()
  }, [formLoading])

  useEffect(() => {
    // Remove success key from screenshotResponse submited via chrome api
    setFormDataState((prev) => ({
      ...prev,
      ...Object.fromEntries(Object.entries(screenshotResponse).filter(([key]) => key !== "success")),
    }));
  }, [screenshotResponse]);

  const setFormData = (update: Partial<FormDataType>) => {
    setFormDataState((prev) => {
      const updatedForm = { ...prev, ...update };
      
      console.log("Updated Form Data:", updatedForm);
      
      return updatedForm;
    });
  };

  return (
    <FormContext.Provider value={{ formData, setFormData, formLoading, setFormLoading }}>
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