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

    const [displayNav, setDisplayNav] = useState<boolean>(false)

    const toggleNav = () => {
        setDisplayNav(prev => !prev)
    }


    return ( 
        <div className="relative">
            <button className="h-[30px] w-[30px] rounded-full bg-gray-500 cursor-pointer grid place-content-center" onClick={toggleNav}>
                <div>
                    <Menu size={20} />
                </div>
            </button>

            <nav className={`rounded-lg absolute -bottom-[160px] -left-[200px] w-[230px] bg-[#262626] text-[#f5f5f5] p-2 grid gap-2 ${displayNav ? 'block' : 'hidden'}`}>
                <button className="rounded-sm p-2 w-full cursor-pointer hover:bg-[#3d3d3d]">Dahboard</button>
                <hr className="" />
                <button className="rounded-sm p-2 w-full cursor-pointer hover:bg-[#3d3d3d]">Profile</button>
                <hr />
                <button onClick={handleLogout} className="rounded-sm cursor-pointer w-full py-2 hover:bg-[#3d3d3d]">Logout</button>
            </nav>

        </div>
     );
}

export default NavButton;