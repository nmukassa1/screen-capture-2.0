import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabase";
import { Menu, LogOut, LayoutDashboard, UserRound } from "lucide-react";
import { useState } from "react";
import { useUserContext } from "../context/UserContext";
// import { api } from "../api/api";

function NavButton() {
  const navigate = useNavigate();
  const { setUser } = useUserContext();

  const handleLogout = async () => {
    chrome.runtime.sendMessage({ action: "logout" }, async (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error sending message:",
          chrome.runtime.lastError.message
        );
        return;
      }
      if (response && response.success) {
        setUser(null);
        navigate("/login");
      }
    });
  };

  const [displayNav, setDisplayNav] = useState<boolean>(false);

  const toggleNav = () => {
    setDisplayNav((prev) => !prev);
  };

  const redirectTo = (url: string) => {
    if (chrome && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.location.href = url; // Fallback for testing outside of Chrome extension
    }
  };

  return (
    <div className="relative">
      <button
        className="text-foreground grid h-9 w-9 cursor-pointer place-content-center rounded-full border border-border bg-secondary transition-all duration-200 hover:scale-[1.02] hover:bg-accent"
        onClick={toggleNav}
      >
        <Menu size={18} />
      </button>

      <nav
        className={`absolute -bottom-[172px] -left-[212px] grid w-[230px] gap-1 rounded-xl border border-border bg-card p-2 text-foreground shadow-sm ${
          displayNav ? "block" : "hidden"
        }`}
      >
        <button
          onClick={() =>
            redirectTo("https://designspo-webpage.vercel.app/dashboard/")
          }
          className="text-foreground hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 text-sm transition-colors"
        >
          <LayoutDashboard size={15} />
          Dashboard
        </button>
        <hr className="border-border" />
        <button
          onClick={() =>
            redirectTo("https://designspo-webpage.vercel.app/dashboard/profile")
          }
          className="text-foreground hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 text-sm transition-colors"
        >
          <UserRound size={15} />
          Profile
        </button>
        <hr className="border-border" />
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm text-red-500 transition-colors hover:bg-red-100/70"
        >
          <LogOut size={15} />
          Logout
        </button>
      </nav>
    </div>
  );
}

export default NavButton;
