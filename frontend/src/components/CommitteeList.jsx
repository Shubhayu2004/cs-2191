import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/committeeList.css";

const CommitteeList = ({ committees }) => {
  return (
    <div className="committee-list">
      <h2>Existing Committees</h2>
      {committees.length === 0 ? (
        <p>No committees found.</p>
      ) : (
        <div className="committees-grid">
          {committees.map((committee) => (
            <Link 
              to={`/committeeDashboard/${committee._id}`} 
              key={committee._id} 
              className="committee-card"
            >
              <h3>{committee.committeeName}</h3>
              <p><strong>Purpose:</strong> {committee.committeePurpose}</p>
              <div className="committee-members">
                <p><strong>Chairman:</strong> {committee.chairman?.name || "N/A"}</p>
                <p><strong>Convener:</strong> {committee.convener?.name || "N/A"}</p>
                <div className="members-section">
                  <strong>Members:</strong>
                  <ul>
                    {committee.members.map((member, index) => (
                      <li key={member.email || index}>{member.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommitteeList;
