import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import "../styles/committee.css";

const CommitteeeApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommitteeVisible, setIsCommitteeVisible] = useState(false);
  const [committeeName, setCommitteeName] = useState('');
  const [committeePurpose, setCommitteePurpose] = useState('');
  const [chairman, setChairman] = useState({ name: '', email: '', contactNumber: '' });
  const [convener, setConvener] = useState({ name: '', email: '', contactNumber: '' });
  const [members, setMembers] = useState([]);
  const [committees, setCommittees] = useState([]);

  useEffect(() => {
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/committees');
      setCommittees(response.data);
    } catch (error) {
      console.error('Error fetching committees:', error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/api/committees/create', {
        committeeName,
        committeePurpose,
        chairman,
        convener,
        members,
      });
      setCommittees([...committees, response.data]);
      setCommitteeName('');
      setCommitteePurpose('');
      setChairman({ name: '', email: '', contactNumber: '' });
      setConvener({ name: '', email: '', contactNumber: '' });
      setMembers([]);
    } catch (error) {
      console.error('Error creating committee:', error);
    }
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  const addMember = () => {
    setMembers([...members, { name: '', email: '', contactNumber: '' }]);
  };

  const populateCom = () => {
    return committees.map((com, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>
          <Link to="/committeeDashboard">{com.committeeName}</Link>
        </td>
      </tr>
    ));
  };

  return (
    <div className="committee-app">
      <div className="sidebar">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        </button>
        {isSidebarOpen && (
          <div className="sidebar-content">
            <Link to="/home">Home</Link>
            <Link to="/committee">Committee</Link>
            <Link to="/user/logout">Logout</Link>
          </div>
        )}
      </div>
      <div className="main-content">
        <h1>Committees</h1>
        <button onClick={() => setIsCommitteeVisible(!isCommitteeVisible)}>
          {isCommitteeVisible ? 'Hide Form' : 'Show Form'}
        </button>
        {isCommitteeVisible && (
          <form onSubmit={handleFormSubmit}>
            <div>
              <label>Committee Name:</label>
              <input
                type="text"
                value={committeeName}
                onChange={(e) => setCommitteeName(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Committee Purpose:</label>
              <input
                type="text"
                value={committeePurpose}
                onChange={(e) => setCommitteePurpose(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Chairman:</label>
              <input
                type="text"
                placeholder="Name"
                value={chairman.name}
                onChange={(e) => setChairman({ ...chairman, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={chairman.email}
                onChange={(e) => setChairman({ ...chairman, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={chairman.contactNumber}
                onChange={(e) => setChairman({ ...chairman, contactNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Convener:</label>
              <input
                type="text"
                placeholder="Name"
                value={convener.name}
                onChange={(e) => setConvener({ ...convener, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={convener.email}
                onChange={(e) => setConvener({ ...convener, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={convener.contactNumber}
                onChange={(e) => setConvener({ ...convener, contactNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Members:</label>
              {members.map((member, index) => (
                <div key={index}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Contact Number"
                    value={member.contactNumber}
                    onChange={(e) => handleMemberChange(index, 'contactNumber', e.target.value)}
                    required
                  />
                </div>
              ))}
              <button type="button" onClick={addMember}>Add Member</button>
            </div>
            <button type="submit">Create Committee</button>
          </form>
        )}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Committee Name</th>
            </tr>
          </thead>
          <tbody>
            {populateCom()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommitteeeApp;