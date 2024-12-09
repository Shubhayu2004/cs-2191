import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import "../styles/committee.css";

const CommitteeeApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommitteeVisible, setIsCommitteeVisible] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [roles, setRoles] = useState([]);

  const ComData = [
    { name: "Tech Committee" },
    { name: "Research and Development Committee" },
    { name: "Cultural Committee" },
    { name: "Sports Committee" },
    { name: "Placement and Internship Committee" },
    { name: "Alumni Relations Committee" },
    { name: "Ethics and Discipline Committee" },
    { name: "IT and Technical Support Committee" },
    { name: "Library Committee" },
    { name: "Sustainability and Environment Committee" },
  ];

  useEffect(() => {
    populateCom();
  }, []);

  const populateCom = () => {
    return ComData.map((com, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>
          <Link to="/committeeDashboard">{com.name}</Link>
        </td>
      </tr>
    ));
  };

  const handleMemberCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setMemberCount(count);
    setRoles(
      Array.from({ length: count }, (_, i) => ({
        name: `Member ${i + 1}`,
      }))
    );
  };

  return (
    <div className="committee">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`} id="sidebar">
        <div className="sidebar-content">
          <Link to="/home">Home</Link>
          <Link to="/committee">Committee</Link>
          <Link to="">Logout</Link>
        </div>
      </div>

      {/* Hamburger */}
      <div
        className={`hamburger ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Button */}
      <button
        className="btn"
        id="create-committee-btn"
        onClick={() => setIsCommitteeVisible(!isCommitteeVisible)}
      >
        Create A Committee
      </button>

      {/* Section: Create Committee */}
      {isCommitteeVisible && (
        <section id="create-committee">
          <button
            className="close-btn"
            onClick={() => setIsCommitteeVisible(false)}
          >
            ×
          </button>
          <h2 className="create">Create Committee</h2>
          <form id="committee-form">
            <label class>Committee Name:</label>
            <input type="text" name="Name" placeholder="Enter Name" />
            <label>Committee Purpose:</label>
            <input type="text" name="Name" placeholder="Enter Purpose" />

            <label>Chairman:</label>
            <input type="text" name="Chairman" placeholder="Enter Name" />
            <input type="text" name="Chairman" placeholder="Enter Email id" />
            <input
              type="number"
              name="Chairman"
              placeholder="Enter contact number"
            />
            <label>Convener:</label>
            <input type="text" name="convener" placeholder="Enter Name" />
            <input type="text" name="convener" placeholder="Enter Email id" />
            <input
              type="number"
              name="convenor"
              placeholder="Enter contact number"
            />

            <label>Enter number of members:</label>
            <input
              type="number"
              id="member-count"
              placeholder="Number of Members"
              value={memberCount}
              onChange={handleMemberCountChange}
            />

            <div id="roles-container">
              {roles.map((role, index) => (
                <div key={index}>
                  <label>{role.name}:</label>
                  <input type="text" placeholder="Enter Name" required />
                  <input type="text" placeholder="Enter Email id" required />
                  <input
                    type="text"
                    placeholder="Enter contact number"
                    required
                  />
                </div>
              ))}
            </div>

            <button type="submit" id="submit-button">
              Create Committee
            </button>
          </form>
        </section>
      )}

      {/* My Committees */}
      <h2 id="MyCom">My Committees</h2>
      <div className="comList">
        <table>
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>Committee Name</th>
            </tr>
          </thead>
          <tbody id="com-list">{populateCom()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default CommitteeeApp;
