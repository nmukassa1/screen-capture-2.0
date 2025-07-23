import { useEffect, useState } from "react";
import Header from "../components/Header";
import SuccessfullUpload from "../components/SuccessfulUpload";
import Form from "../components/Form";
import { ScreenshotResponse } from "../types";
import { FormProvider } from "../context/FormContext";
import { User } from "@supabase/supabase-js";

function MainApplication({ user }: { user: User }) {
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [screenshotCaptured, setScreenshotCaptured] =
    useState<ScreenshotResponse>({
      success: false,
    });

  useEffect(() => {
    // Automatically take screenshot when popup loads
    chrome.runtime.sendMessage(
      { action: "capture_screenshot" },
      async (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error sending message:",
            chrome.runtime.lastError.message
          );
          return;
        }

        if (response?.success) {
          const [tab] = await chrome.tabs.query({
            active: true,
            lastFocusedWindow: true,
          });

          chrome.scripting.executeScript({
            args: [response],
            target: { tabId: tab.id! },
            func: (response) => {
              console.log("Screenshot taken:", response);
            },
          });

          setScreenshotCaptured({
            image: response.screenshot,
            success: true,
            siteUrl: response.siteUrl,
            siteName: response.siteName,
          });
        } else {
          console.error("Screenshot capture failed:", response?.error);
        }
      }
    );
  }, []);

  return (
    <FormProvider screenshotResponse={screenshotCaptured} user={user}>
      <div className="popup-width p-4">
        <Header />
        <main className="mt-4 min-h-[200px]">
          {!screenshotUploaded ? (
            <Form setScreenshotUploaded={setScreenshotUploaded} />
          ) : (
            <SuccessfullUpload />
          )}
        </main>
      </div>
    </FormProvider>
  );
}

export default MainApplication;
