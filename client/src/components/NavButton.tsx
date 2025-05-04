import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { Menu } from "lucide-react";
import { useState } from "react";

function NavButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await chrome.storage.local.remove("session");
    navigate("/login");
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
        className="h-[30px] w-[30px] rounded-full bg-[#262626] cursor-pointer grid place-content-center"
        onClick={toggleNav}
      >
        <div className="text-[#f5f5f5]">
          <Menu size={20} />
        </div>
      </button>

      <nav
        className={`rounded-lg absolute -bottom-[160px] -left-[200px] w-[230px] bg-[#262626] text-[#f5f5f5] p-2 grid gap-2 ${
          displayNav ? "block" : "hidden"
        }`}
      >
        <button
          onClick={() => redirectTo("http://localhost:3001/dashboard/")}
          className="text-center rounded-sm p-2 w-full cursor-pointer hover:bg-[#3d3d3d]"
        >
          Dahboard
        </button>
        <hr className="" />
        <button
          onClick={() => redirectTo("http://localhost:3001/dashboard/profile")}
          className="text-center rounded-sm p-2 w-full cursor-pointer hover:bg-[#3d3d3d]"
        >
          Profile
        </button>
        <hr />
        <button
          onClick={handleLogout}
          className="rounded-sm cursor-pointer w-full py-2 text-center hover:bg-[#3d3d3d]"
        >
          Logout
        </button>
      </nav>
    </div>
  );
}

export default NavButton;
