import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { sendToBackground, type AuthStateChangedMessage } from "../messages";

interface UserContextType {
  /** `undefined` while the session is still being loaded from the background worker. */
  user: User | null | undefined;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    sendToBackground<User | null>({ action: "get_user" })
      .then((response) => setUser(response.success ? response.data : null))
      .catch(() => setUser(null));

    const onMessage = (message: AuthStateChangedMessage) => {
      if (message?.action === "auth_state_changed") setUser(message.user);
    };
    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
