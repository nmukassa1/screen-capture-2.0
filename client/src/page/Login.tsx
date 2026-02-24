import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { User } from "@supabase/supabase-js";
// import { api } from "../api/api";

const Login = ({ setUser }: { setUser: (value: User) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      chrome.runtime.sendMessage(
        { action: "login", email, password },
        async (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error sending message:",
              chrome.runtime.lastError.message
            );
            return;
          }
          if (response && response.user) {
            setUser(response.user);
            setError("");
            navigate("/mainApp");
          } else {
            setError("Login failed. Please check your credentials.");
          }
        }
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      chrome.runtime.sendMessage({ action: "login-error", error });
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
