import { useState } from "react";
import Header from "../components/Header";
import ScreenshotButton from "../components/ScreenshotButton";
import SuccessfullUpload from "../components/SuccessfulUpload";
import Form from "../components/Form";
import { ScreenshotResponse } from "../types";
import { FormProvider } from "../context/FormContext";
import { User } from "@supabase/supabase-js";

function MainApplication({ user }: { user: User }) {
  const [screenshotUploaded, setScreenshotUploaded] = useState<boolean>(false);

  const [screenshotCaptured, setScreenshotCaptured] =
    useState<ScreenshotResponse>({ success: false });

  return (
    <FormProvider screenshotResponse={screenshotCaptured} user={user}>
      <div className="popup-width p-4">
        <Header />
        <main className="mt-4 min-h-[200px]">
          {!screenshotUploaded ? (
            screenshotCaptured.success ? (
              <Form setScreenshotUploaded={setScreenshotUploaded} />
            ) : (
              <ScreenshotButton setScreenshotCaptured={setScreenshotCaptured} />
            )
          ) : (
            <SuccessfullUpload />
          )}
        </main>
      </div>
    </FormProvider>
  );
}

export default MainApplication;
