import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import '../styles/home.css';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleMenu = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="home">
      {/* Sidebar Menu */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-content">
          <Link to="/">Home</Link>
          <Link to="/committee">Committee</Link>
          <Link to="/">Logout</Link>
        </div>
      </div>
      {/* Hamburger Icon */}
      <div className={`hamburger ${isSidebarOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Main Content */}
      <div className="Home">
        <h2 className="homeHead">Meeting Management Automation Workspace</h2>
        <div className="top">
          <div id="pfp">
            <img
              src="https://static.vecteezy.com/system/resources/previews/036/280/650/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
              alt="Profile"
            />
          </div>
          <div id="person">
            <p><i className="fas fa-user"></i> Name: First Middle Last</p>
            <p><i className="fas fa-envelope"></i> User ID: firstlast@gmail.com</p>
            <p><i className="fas fa-briefcase"></i> Role: Head Of the Department, CST</p>
          </div>
          <div id="logo">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/thumb/a/ac/IIEST_Shibpur_Logo.svg/1200px-IIEST_Shibpur_Logo.svg.png"
              alt="Logo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
