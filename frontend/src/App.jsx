import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/home.jsx";
import CommitteeApp from "./pages/committee.jsx";
import CommitteeDashboard from "./pages/committeeDash.jsx";
import WelcomePage from "./pages/welcome.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/Registerpage.jsx";
import ScheduleMeeting from "./pages/scheduleMeeting.jsx";
import UserProtectWrapper from "./pages/userProtectWrapper.jsx";
import UserLogout from "./pages/UserLogout.jsx";
import ManageUsers from "./pages/ManageUsers.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import UserContext from "./context/UserContext.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

const App = () => {
  return (
    <AuthProvider>
      <UserContext>
        <Routes>
          {/* Handle root path */}
          <Route path="/" element={<WelcomePage />} />

          {/* Other defined routes */}
          <Route path="/Schedule_meeting" element={<ScheduleMeeting />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/Register" element={<RegisterPage />} />
          <Route path="/committee" element={<CommitteeApp />} />
          <Route path="/committeeDashboard" element={<CommitteeDashboard />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/home" element={
            <UserProtectWrapper>
              <Home />
            </UserProtectWrapper>
          } />
          <Route path="/user/logout" element={
            <UserProtectWrapper>
              <UserLogout />
            </UserProtectWrapper>
          } />
        </Routes>
      </UserContext>
    </AuthProvider>
  );
};

export default App;