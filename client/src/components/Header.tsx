import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function Header() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        await chrome.storage.local.remove("session");
        navigate("/login");
    };

    return ( 
        <header className="flex items-center justify-between">
            <h1 className="font-bold text-lg">Designspo</h1>
            
            <div className="h-[25px] w-[25px] rounded-full bg-gray-500">
                <button onClick={handleLogout}>L</button>
            </div>
        </header>
     );
}

export default Header;