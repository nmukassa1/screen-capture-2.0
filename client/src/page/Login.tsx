import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

import { User } from "@supabase/supabase-js";

const Login = ({ setUser }: { setUser: (value: User) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // await chrome.storage.local.set({ session: data.session });
      localStorage.setItem("session", JSON.stringify(data.session));
      // await supabase.auth.setSession({
      //   access_token: data.session.access_token,
      //   refresh_token: data.session.refresh_token,
      // });

      // await serviceWorker(data.session.access_token);

      setUser(data.session.user);
      navigate("/dashboard");
      console.log(data);
    }
  };

  return (
    <div className="popup-width p-6">
      <form className="flex flex-col mt-10" onSubmit={handleLogin}>
        <h2 className="text-2xl font-semibold mb-8 text-center">Login</h2>

        <div className="mb-6">
          <label className="mb-2">Email</label>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="bg-gray-300 px-3 py-4 text-[1.4rem] rounded-lg w-full outline-white"
          />
        </div>

        <div>
          <label className="mb-2">Password</label>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className="bg-gray-300 px-3 py-4 text-[1.4rem] rounded-lg w-full outline-white"
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="bg-black text-white px-4 py-4 rounded-2xl my-6 cursor-pointer"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;

// async function serviceWorker(data: string) {
//   chrome.runtime.sendMessage(
//     { action: "set_cookie", data },
//     async (response) => {
//       if (chrome.runtime.lastError) {
//         console.error(
//           "Error sending message:",
//           chrome.runtime.lastError.message
//         );
//         return;
//       }
//       if (response && response.success) {
//         const [tab] = await chrome.tabs.query({
//           active: true,
//           lastFocusedWindow: true,
//         });
//         chrome.scripting.executeScript({
//           args: [response],
//           target: { tabId: tab.id! },
//           func: (response) => {
//             console.log("Response received:", response);
//           },
//         });
//       } else {
//         console.error("Error:", response);
//       }
//     }
//   );
// }
