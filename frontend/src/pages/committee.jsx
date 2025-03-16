import { UserDataContext } from '../context/UserContext';
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
  const { user } = React.useContext(UserDataContext);

  useEffect(() => {
    fetchCommittees();
  }, []);

  const fetchCommittees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/committees`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCommittees(response.data);
    } catch (error) {
      console.error('Error fetching committees:', error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/committees/create`, {
        committeeName,
        committeePurpose,
        chairman,
        convener,
        members,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCommittees([...committees, response.data]);
      setIsCommitteeVisible(false);
      // Reset form
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

  const toggleFormVisibility = () => {
    setIsCommitteeVisible(!isCommitteeVisible);
  };

  return (
    <div className="committee">
      <div className="main-content">
        {user?.status === 'admin' && (
          <div>
            <button className="btn" onClick={toggleFormVisibility}>
              {isCommitteeVisible ? 'Hide Form' : 'Show Form'}
            </button>
            <button className="addmemberbtn" onClick={addMember}>
              Add Member
            </button>
          </div>
        )}
        {isCommitteeVisible && (
          <form onSubmit={handleFormSubmit} className="create-committee">
            <div className="box">
              <div className="form-row">
                <label>Committee Name:</label>
                <input type="text" value={committeeName} onChange={(e) => setCommitteeName(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Committee Purpose:</label>
                <textarea value={committeePurpose} onChange={(e) => setCommitteePurpose(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Chairman Name:</label>
                <input type="text" value={chairman.name} onChange={(e) => setChairman({ ...chairman, name: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Chairman Email:</label>
                <input type="email" value={chairman.email} onChange={(e) => setChairman({ ...chairman, email: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Chairman Contact Number:</label>
                <input type="text" value={chairman.contactNumber} onChange={(e) => setChairman({ ...chairman, contactNumber: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Convener Name:</label>
                <input type="text" value={convener.name} onChange={(e) => setConvener({ ...convener, name: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Convener Email:</label>
                <input type="email" value={convener.email} onChange={(e) => setConvener({ ...convener, email: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Convener Contact Number:</label>
                <input type="text" value={convener.contactNumber} onChange={(e) => setConvener({ ...convener, contactNumber: e.target.value })} />
              </div>
              {members.map((member, index) => (
                <div key={index}>
                  <div className="form-row">
                    <label>Member {index + 1} Name:</label>
                    <input type="text" value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} />
                  </div>
                  <div className="form-row">
                    <label>Member {index + 1} Email:</label>
                    <input type="email" value={member.email} onChange={(e) => handleMemberChange(index, 'email', e.target.value)} />
                  </div>
                  <div className="form-row">
                    <label>Member {index + 1} Contact Number:</label>
                    <input type="text" value={member.contactNumber} onChange={(e) => handleMemberChange(index, 'contactNumber', e.target.value)} />
                  </div>
                </div>
              ))}
              <button type="submit" className="committeebtn">
                Create Committee
              </button>
            </div>
          </form>
        )}
        {/* Display committees */}
        <div className="box">
          {committees.map((committee, index) => (
            <div key={index}>
              <h3>Committee Name: {committee.committeeName}</h3>
              <p>Committee Purpose: {committee.committeePurpose}</p>
              <p>Chairman: {committee.chairman.name}</p>
              <p>Convener: {committee.convener.name}</p>
              <h4>Members:</h4>
              {committee.members.map((member, memberIndex) => (
                <div key={memberIndex}>
                  <p>Member {memberIndex + 1}: {member.name}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommitteeeApp;
