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
      <div className="popup-width relative overflow-hidden bg-background p-4">
        <div className="pointer-events-none absolute -top-20 -left-20 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-44 w-44 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative rounded-2xl border border-border bg-card p-4 shadow-sm">
          <Header />
          <main className="mt-4 min-h-[220px]">
            {!screenshotUploaded ? (
              <Form setScreenshotUploaded={setScreenshotUploaded} />
            ) : (
              <SuccessfullUpload />
            )}
          </main>
        </div>
      </div>
    </FormProvider>
  );
}

export default MainApplication;
