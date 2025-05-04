import { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainApplication from "./page/MainApplication";
import Login from "./page/Login";
import { supabase } from "./supabase";
import { useUserContext } from "./context/UserContext";

function App() {
  //   const [loading, setLoading] = useState(true);
  const { user, setUser } = useUserContext();

  useEffect(() => {
    async function restoreSession() {
      // const result = localStorage.getItem("session");
      const result = await chrome.storage.local.get("session");
      if (result.session) {
        // const session = JSON.parse(result);
        supabase.auth.setSession(result.session);
        setUser(result.session.user);
      }
      //   setLoading(false);
    }
    restoreSession();
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (session) {
          // localStorage.setItem('session', JSON.stringify(session));
          chrome.storage.local.set({ session });
          setUser(session.user);
        } else {
          // localStorage.removeItem("session");
          chrome.storage.local.remove("session");
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  //   if (loading) return <p>Loading...</p>;

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
