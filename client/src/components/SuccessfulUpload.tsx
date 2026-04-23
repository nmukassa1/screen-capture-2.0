import { useEffect } from "react";
import Tick from "../assets/tick-vecotr.png";

function SuccessfullUpload() {
  useEffect(() => {
    const uploadConfirmation = document.getElementById("upload-confirmation");
    uploadConfirmation?.classList.add("opacity-0");

    const fadeIn = setTimeout(() => {
      uploadConfirmation?.classList.remove("opacity-0");
    }, 300);
    return () => {
      clearTimeout(fadeIn);
    };
  }, []);

  return (
    <div
      id="upload-confirmation"
      className="grid min-h-[220px] place-content-center transition-opacity duration-500 ease-in"
    >
      <div className="grid place-items-center gap-4 text-center">
        <div className="bg-accent/20 flex h-[140px] w-[140px] items-center justify-center rounded-full border border-border shadow-sm">
          <img src={Tick} alt="Tick" className="w-1/2" />
        </div>
        <p className="text-foreground text-sm font-medium">Saved successfully</p>
      </div>
    </div>
  );
}

export default SuccessfullUpload;