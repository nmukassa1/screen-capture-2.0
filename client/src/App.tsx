import {  useState } from "react";
import Header from "./components/Header";
import ScreenshotButton from "./components/ScreenshotButton";
import SuccessfullUpload from "./components/SuccessfulUpload";
import Form from "./components/Form";
import { ScreenshotResponse } from "./types";
import { FormProvider } from "./context/FormContext";

function App() {

  const [screenshotUploaded, setScreenshotUploaded] = useState<boolean>(false);

  const [screenshotCaptured, setScreenshotCaptured] = useState<ScreenshotResponse>({ success: true});

  return (
    <FormProvider screenshotResponse={screenshotCaptured} >
      <div className="w-[400px] border-2 border-black p-4">
        <Header />
        <main className="mt-4">
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
  )
}

export default App;