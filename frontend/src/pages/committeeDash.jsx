import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from "jspdf";
import "../styles/committeeDash.css";
import { UserDataContext } from '../context/UserContext';

function CommitteeDashboard() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useContext(UserDataContext);

    const [committee, setCommittee] = useState({
        committeeName: '',
        committeePurpose: '',
        chairman: { name: '', email: '', contactNumber: '' },
        convener: { name: '', email: '', contactNumber: '' },
        members: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRecentMeetings, setShowRecentMeetings] = useState(false);
    const [selectedMinutes, setSelectedMinutes] = useState("");
    const [showMinutes, setShowMinutes] = useState(false);
    const [editedMinutes, setEditedMinutes] = useState("");
    const [selectedMeetingIndex, setSelectedMeetingIndex] = useState(null);

    const DUMMY_RECENT_MEETINGS = [
        {
            topic: "Budget Planning",
            date: "2024-03-10",
            time: "10:00 AM",
            minutesText: "Discussed allocation of funds for upcoming projects and reviewed last quarter's expenses."
        },
        {
            topic: "Annual Report Discussion",
            date: "2024-03-15",
            time: "2:30 PM",
            minutesText: "Reviewed department performance, proposed improvements, and finalized the annual report format."
        },
        {
            topic: "Event Coordination",
            date: "2024-03-20",
            time: "11:00 AM",
            minutesText: "Planned logistics, assigned roles, and confirmed the venue for the upcoming seminar."
        }
    ];

    const [recentMeetings, setRecentMeetings] = useState(DUMMY_RECENT_MEETINGS);

    const isChairman = user?.status === "chairman";
    const isConvener = user?.status === "convener";
    const canEditMinutes = isChairman;
    const canScheduleMeetings = isChairman || isConvener;

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

    const handleViewMinutes = (minutesText, index) => {
        setSelectedMinutes(minutesText);
        setEditedMinutes(minutesText);
        setSelectedMeetingIndex(index);
        setShowMinutes(true);
    };

    const handleSaveMinutes = async () => {
        if (selectedMeetingIndex === null || !canEditMinutes) return;

        try {
            const updatedMeetings = [...recentMeetings];
            updatedMeetings[selectedMeetingIndex].minutesText = editedMinutes;
            setRecentMeetings(updatedMeetings);
            setShowMinutes(false);
            setSelectedMeetingIndex(null);
        } catch (err) {
            setError('Failed to save minutes');
        }
    };

    const handleGeneratePDF = () => {
        if (!selectedMinutes) return;
        const doc = new jsPDF();
        const maxWidth = 190;
        const textLines = doc.splitTextToSize(selectedMinutes, maxWidth);
        doc.text(textLines, 10, 10);
        doc.save("minutes.pdf");
    };

    const handleLeaveCommittee = async () => {
        try {
            const token = localStorage.getItem('token');
            const confirmed = window.confirm('Are you sure you want to leave this committee?');
            
            if (!confirmed) return;
    
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/committees/${id}/leave`,
                { userId: user._id }, // Add user ID to request body
                { 
                    headers: {  
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            alert('You have successfully left the committee');
            navigate('/committee');
        } catch (err) {
            console.error('Error leaving committee:', err);
            setError(err.response?.data?.message || 'Error leaving committee');
            alert('Failed to leave committee');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!committee) return <div>No committee found</div>;

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
                {canScheduleMeetings && (
                    <a href="/scheduleMeeting" className="schedule-btn">
                        Schedule Meeting
                    </a>
                )}

                <a href="/scheduleCalendar" className="upcoming-btn">
                    Upcoming Meetings
                </a>
                
                <button onClick={() => setShowRecentMeetings(prev => !prev)}>
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

            {showRecentMeetings && (
                <section className="recent-meetings-section">
                    <button className="close-btn" onClick={() => setShowRecentMeetings(false)}>
                        ✕
                    </button>
                    <h2>Recent Meetings</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th>Topic</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Minutes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentMeetings.map((meeting, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{meeting.topic}</td>
                                    <td>{meeting.date}</td>
                                    <td>{meeting.time}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleViewMinutes(meeting.minutesText, index)}
                                            className="minutes-button"
                                        >
                                            View Minutes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {showMinutes && (
                <section id="minu">
                    <form id="minutes">
                        <button type="button" className="close-btn" onClick={() => setShowMinutes(false)}>
                            ✕
                        </button>
                        <label htmlFor="detail">Meeting Minutes:</label>
                        <textarea
                            id="detail"
                            value={editedMinutes}
                            onChange={(e) => setEditedMinutes(e.target.value)}
                            readOnly={!canEditMinutes}
                        />
                        
                        {canEditMinutes && (
                            <button type="button" id="save" onClick={handleSaveMinutes}>
                                Save
                            </button>
                        )}

                        <button type="button" id="generate-pdf" onClick={handleGeneratePDF}>
                            Generate PDF
                        </button>
                    </form>
                </section>
            )}
        </div>
    );
}

export default CommitteeDashboard;