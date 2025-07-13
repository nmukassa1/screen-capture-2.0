import { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainApplication from "./page/MainApplication";
import Login from "./page/Login";
import { useUserContext } from "./context/UserContext";
// import { api } from "./api/api";

function App() {
  const { user, setUser } = useUserContext();

  useEffect(() => {
    async function restoreSession() {
      chrome.runtime.sendMessage(
        { action: "restore-session" },
        async (response) => {
          if (response && response.user) {
            setUser(response.user);
            return;
          }
        }
      );
      // const { data } = await api.get("/auth/restore-session");
      // setUser(data.user);
    }
    restoreSession();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/mainApp" /> : <Login setUser={setUser} />
          }
        />
        <Route
          path="/mainApp"
          element={
            user ? <MainApplication user={user} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="*"
          element={<Navigate to={user ? "/mainApp" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
