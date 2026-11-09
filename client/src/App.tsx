import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainApplication from "./page/MainApplication";
import Login from "./page/Login";
import Spinner from "./components/Spinner";
import { useUserContext } from "./context/UserContext";

function App() {
  const { user } = useUserContext();

  if (user === undefined) {
    return (
      <div className="popup-width bg-background p-4">
        <Spinner />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/mainApp" /> : <Login />}
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
