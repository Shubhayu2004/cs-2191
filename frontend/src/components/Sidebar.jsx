import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/sidebar.css";


const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <button className="toggle-button" onClick={toggleSidebar}>
          ✖
        </button>
        <nav className="sidebar-nav">
          <Link to="/home">Home</Link>
          <Link to="/committee">Committee</Link>
          <Link to="/user/logout">Logout</Link>
        </nav>
      </div>

      {/* Hamburger button when sidebar is closed */}
      {!isOpen && (
        <button className="hamburger-button" onClick={toggleSidebar}>
          ☰
        </button>
      )}
    </div>
  );
};

export default Sidebar;
