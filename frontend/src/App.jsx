import { React } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import Home from "./pages/home.jsx";
import CommitteeApp from "./pages/committee.jsx";
import CommitteeDashboard from "./pages/committeeDash.jsx";
// import ScheduleMeeting from "./pages/scheduleMeeting.jsx";
import Landing from "./pages/landing.jsx"
const App = () => {
  return (
    <div>
      <Routes>
        {/* Handle root path */}
        <Route path="/" element={<Navigate to="/home" />} />

        {/* Other defined routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/committee" element={<CommitteeApp />} />
        <Route path="/committeeDashboard" element={<CommitteeDashboard />} />
        {/* <Route path="/scheduleMeeting" element={< ScheduleMeeting />} /> */}
        <Route path="/landing" element={< Landing />} />
      </Routes>
    </div>
  );
};

export default App;
