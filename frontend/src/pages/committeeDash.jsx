import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from "jspdf";
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

    // Dummy data for testing
    const dummyRecentMeetings = [
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


    const [recentMeetings, setRecentMeetings] = useState(dummyRecentMeetings); //will be fetched from the backend

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUpcomingMeetings, setShowUpcomingMeetings] = useState(false);
    const [showRecentMeetings, setShowRecentMeetings] = useState(false);
    const [selectedMinutes, setSelectedMinutes] = useState(""); // Stores the clicked meeting's minutes text
    const [showMinutes, setShowMinutes] = useState(false);
    const [editedMinutes, setEditedMinutes] = useState(""); // Stores the edited text
    const [selectedMeetingIndex, setSelectedMeetingIndex] = useState(null); // Stores the index of the meeting being edited

    const handleViewMinutes = (minutesText, index) => {
        setSelectedMinutes(minutesText);
        setEditedMinutes(minutesText); // Allow editing
        setSelectedMeetingIndex(index); // Store index for saving
        setShowMinutes(true);
    };

    const handleSaveMinutes = () => {
        if (selectedMeetingIndex === null) return;

        const updatedMeetings = [...recentMeetings];
        updatedMeetings[selectedMeetingIndex].minutesText = editedMinutes;
        setRecentMeetings(updatedMeetings);

        setShowMinutes(false);
        setSelectedMeetingIndex(null);
    };



    const closeMinutes = () => {
        setShowMinutes(false);
        setSelectedMinutes("");
    };
    const handleGeneratePDF = () => {
        if (!selectedMinutes) return;
        const doc = new jsPDF();
        const maxWidth = 190;
        const textLines = doc.splitTextToSize(selectedMinutes, maxWidth);
        doc.text(textLines, 10, 10);
        doc.save("minutes.pdf");
    };
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
                <a href="/scheduleMeeting" className="schedule-btn">
                    ScheduleMeeting
                </a>
                <a href="/scheduleCalendar" className="upcoming-btn">
                    Upcoming Meetings
                </a>
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

            {/* {showUpcomingMeetings && (
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
            )} */}

            {showRecentMeetings && (
                <section className="recent-meetings-section">
                    <button className="close-btn" onClick={() => setShowRecentMeetings(false)}>
                        ✕
                    </button>
                    <h2 style={{ textAlign: "center" }}>Recent Meetings</h2>
                    <table>
                        <thead>
                            <tr >
                                <th>Sl No.</th>
                                <th>Topic</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Minutes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentMeetings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center" }}>
                                        No recent meetings
                                    </td>
                                </tr>
                            ) : (
                                recentMeetings.map((meeting, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{meeting.topic}</td>
                                        <td>{meeting.date}</td>
                                        <td>{meeting.time}</td>
                                        <td>

                                            <button onClick={() => handleViewMinutes(meeting.minutesText, index)} className="minutes-button">
                                                View Minutes
                                            </button>

                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </section>
            )}

            {showMinutes && (
                <section id="minu">
                    <form id="minutes">
                        <button type="button" className="close-btn" onClick={closeMinutes}>✕</button>
                        <label htmlFor="detail">Meeting Minutes:</label>
                        <textarea
                            id="detail"
                            value={editedMinutes}
                            onChange={(e) => setEditedMinutes(e.target.value)}
                        ></textarea>
                        <br /><br />
                        <button type="button" id="save" onClick={handleSaveMinutes}>Save</button>
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