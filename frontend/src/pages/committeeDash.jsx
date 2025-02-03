import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import "../styles/committeeDash.css";

function CommitteeDashboard() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [committee, setCommittee] = useState({
        committeeName: '',
        committeePurpose: '',
        chairman: { name: '', email: '', contactNumber: '' },
        convener: { name: '', email: '', contactNumber: '' },
        members: []
    });
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [recentMeetings, setRecentMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUpcomingMeetings, setShowUpcomingMeetings] = useState(false);
    const [showRecentMeetings, setShowRecentMeetings] = useState(false);

    useEffect(() => {
        const fetchCommitteeData = async () => {
            if (!id) {
                setError('No committee ID provided');
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/api/committees/${id}`,
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                setCommittee(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching committee:', err);
                setError(err.response?.data?.message || 'Error loading committee');
                setLoading(false);
            }
        };

        fetchCommitteeData();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!committee) return <div>No committee found</div>;


    const toggleSection = (setter) => {
        setter(prev => !prev);
    };

    const handleLeaveCommittee = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/committees/${id}/leave`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate('/committee');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="committeeDash">
            <div className="back">
                <button onClick={() => navigate('/committee')}>Go Back</button>
            </div>

            <div className="primary">
                <div className="desc">
                    <h2 id="comName">{committee.committeeName}</h2>
                    <h3 id="purp">Purpose:</h3>
                    <p id="purpose">{committee.committeePurpose}</p>
                </div>
                
                <div className="chief">
                    <div className="chairman">
                        <h4>Chairperson</h4>
                        <p>Name: {committee.chairman.name}</p>
                        <p>Email: {committee.chairman.email}</p>
                        <p>Contact: {committee.chairman.contactNumber}</p>
                    </div>
                    
                    <div className="convener">
                        <h4>Convener</h4>
                        <p>Name: {committee.convener.name}</p>
                        <p>Email: {committee.convener.email}</p>
                        <p>Contact: {committee.convener.contactNumber}</p>
                    </div>
                </div>
            </div>

            <div className="utility">
                <button onClick={() => toggleSection(setShowUpcomingMeetings)}>
                    {showUpcomingMeetings ? 'Hide' : 'Show'} Upcoming Meetings
                </button>
                <button onClick={() => toggleSection(setShowRecentMeetings)}>
                    {showRecentMeetings ? 'Hide' : 'Show'} Recent Meetings
                </button>
                <button onClick={handleLeaveCommittee} className="leave-btn">
                    Leave Committee
                </button>
            </div>

            <div className="members">
                <h2>Committee Members</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Sl No.</th>
                            <th>Name</th>
                            <th>Email ID</th>
                            <th>Contact No.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {committee.members.map((member, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{member.name}</td>
                                <td>{member.email}</td>
                                <td>{member.contactNumber}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showUpcomingMeetings && (
                <div className="meetings upcoming">
                    <h3>Upcoming Meetings</h3>
                    {upcomingMeetings.length === 0 ? (
                        <p>No upcoming meetings scheduled</p>
                    ) : (
                        <ul>
                            {upcomingMeetings.map((meeting, index) => (
                                <li key={index}>{meeting.title} - {meeting.date}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {showRecentMeetings && (
                <div className="meetings recent">
                    <h3>Recent Meetings</h3>
                    {recentMeetings.length === 0 ? (
                        <p>No recent meetings</p>
                    ) : (
                        <ul>
                            {recentMeetings.map((meeting, index) => (
                                <li key={index}>{meeting.title} - {meeting.date}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default CommitteeDashboard;