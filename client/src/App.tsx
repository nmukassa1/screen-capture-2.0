import { useState } from "react";
import Header from "./components/Header";
import ScreenshotButton from "./components/ScreenshotButton";
import SuccessfullUpload from "./components/SuccessfulUpload";
import Form from "./components/Form";

function App() {

  const [screenshotUploaded, setScreenshotUploaded] = useState<boolean>(false);
  const [screenshotCaptured, setScreenshotCaptured] = useState<boolean>(false);

  return (
    <div className="w-[400px] border-2 border-black p-4">
      <Header />
      <main className="mt-4">
        {screenshotCaptured ? <Form setScreenshotUploaded={setScreenshotUploaded} /> : <ScreenshotButton setScreenshotCaptured={setScreenshotCaptured} />}
        {screenshotUploaded && <SuccessfullUpload />}

      </main>
    </div>
  )
}

export default App;