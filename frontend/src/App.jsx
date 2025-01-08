import { React } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import Home from "./pages/home.jsx";
import CommitteeApp from "./pages/committee.jsx";
import CommitteeDashboard from "./pages/committeeDash.jsx";
import WelcomePage from "./pages/welcome.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/Registerpage.jsx";
import ScheduleMeeting from "./pages/scheduleMeeting.jsx";
import UserProtectWrapper from "./pages/userProtectWrapper.jsx";
import UserLogout from "./pages/UserLogout.jsx";
import UserContext from "./context/UserContext.jsx";
const App = () => {
  return (
    <div>
      <Routes>
        {/* Handle root path */}
        <Route path="/" element={<WelcomePage/>} />

        {/* Other defined routes */}
        <Route path="/Schedule_meeting" element={<ScheduleMeeting />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/Register" element={<RegisterPage />} />
        {/* <Route path="/home" element={<Home />} /> */}
        <Route path="/committee" element={<CommitteeApp />} />
        <Route path="/committeeDashboard" element={<CommitteeDashboard />} />
        <Route path='/home'
          element={
            <UserProtectWrapper>
              <Home />
            </UserProtectWrapper>
          } />
        <Route path='/user/logout'
          element={<UserProtectWrapper>
            <UserLogout />
          </UserProtectWrapper>
          } />
      </Routes>
    </div>
  );
};

export default App;
