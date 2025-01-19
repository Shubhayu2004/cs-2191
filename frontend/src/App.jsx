import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import CommitteeApp from "./pages/committee";
import CommitteeDashboard from "./pages/CommitteeDash";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/Registerpage";
import WelcomePage from "./pages/welcome";
import UserProtectWrapper from "./pages/userProtectWrapper";
import { UserDataContext } from "./context/UserContext";

const App = () => {
  const { user } = useContext(UserDataContext);

  return (
    <div>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<UserProtectWrapper><Home /></UserProtectWrapper>} />
        <Route path="/committee" element={<UserProtectWrapper><CommitteeApp /></UserProtectWrapper>} />
        <Route path="/committeeDashboard" element={<UserProtectWrapper><CommitteeDashboard /></UserProtectWrapper>} />
        {/* Role-based route: Only admins can access */}
        <Route path="/admin" element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/home" />} />
      </Routes>
    </div>
  );
};

export default App;
