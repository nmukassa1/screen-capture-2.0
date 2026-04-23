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
    <div className="popup-width relative overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute -top-20 -left-20 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-14 bottom-8 h-44 w-44 rounded-full bg-accent/15 blur-3xl" />
      <form
        className="relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
        onSubmit={handleLogin}
      >
        <p className="text-muted-foreground mb-2 text-center text-xs font-medium tracking-[0.2em] uppercase">
          Designspo Extension
        </p>
        <h2 className="text-foreground mb-6 text-center text-2xl font-semibold">
          Welcome back
        </h2>

        <div className="mb-4">
          <label className="text-foreground/90 mb-2 block text-sm">Email</label>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="placeholder:text-muted-foreground focus-visible:ring-ring/50 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm outline-none focus-visible:ring-[3px]"
          />
        </div>

        <div className="mb-2">
          <label className="text-foreground/90 mb-2 block text-sm">Password</label>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className="placeholder:text-muted-foreground focus-visible:ring-ring/50 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm outline-none focus-visible:ring-[3px]"
          />
        </div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          className="mt-6 cursor-pointer rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
