import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from "jspdf";
import "../styles/committeeDash.css";
import { UserDataContext } from '../context/UserContext';
import React from "react";
import { Link } from 'react-router-dom';

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
    const [suggestionBoxIndex, setSuggestionBoxIndex] = useState(null);
    const [suggestionText, setSuggestionText] = useState("");

    const isConvener = user?.status === "convener";
    const isMember = user?.status === "member";
    const canEditMinutes = isConvener;
    const canScheduleMeetings = isConvener;
    const canManageUsers = user?.status === "admin" || user?.status === "chairman";
    const [newMinutesText, setNewMinutesText] = useState("");
    const [showCreateMoM, setShowCreateMoM] = useState(false);


    const DUMMY_RECENT_MEETINGS = React.useMemo(() => [
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
    ], []);

    const [recentMeetings, setRecentMeetings] = useState([]);

    const fetchMinutes = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/api/minutes/committee/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (response.data && response.data.length > 0) {
                setRecentMeetings(response.data);
            } else {
                setRecentMeetings(DUMMY_RECENT_MEETINGS);
            }
        } catch (err) {
            console.error('Error fetching minutes:', err);
            setError(err.response?.data?.message || 'Error loading minutes');
            setRecentMeetings(DUMMY_RECENT_MEETINGS);
        }
    }, [id, DUMMY_RECENT_MEETINGS]);

    const fetchCommitteeData = useCallback(async () => {
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
    }, [id]);

    useEffect(() => {
        fetchCommitteeData();
    }, [fetchCommitteeData]);

    const handleToggleRecentMeetings = () => {
        if (!showRecentMeetings && recentMeetings.length === 0) {
            fetchMinutes();
        }
        setShowRecentMeetings(prev => !prev);
    };

    const handleViewMinutes = (minutesText, index) => {
        setSelectedMinutes(minutesText);
        setEditedMinutes(minutesText);
        setSelectedMeetingIndex(index);
        setShowMinutes(true);
    };

    const handleSaveMinutes = async () => {
        if (selectedMeetingIndex === null || !canEditMinutes) return;

        try {
            const token = localStorage.getItem('token');
            const meeting = recentMeetings[selectedMeetingIndex];

            await axios.put(
                `${import.meta.env.VITE_BASE_URL}/api/minutes/${meeting._id}`,
                {
                    minutesText: editedMinutes
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            await fetchMinutes();
            setShowMinutes(false);
            setSelectedMeetingIndex(null);
        } catch {
            setError('Failed to save minutes');
        }
    };
    const handleSaveNewMoM = async () => {
        if (!newMinutesText.trim()) return; // Do not save if empty

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/minutes/committee/${id}`,
                { minutesText: newMinutesText },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            alert("MoM saved successfully!");
            setNewMinutesText(""); // Reset the form
            setShowCreateMoM(false); // Close the form
            fetchMinutes(); // Optionally refresh the list of meetings/minutes
        } catch (err) {
            console.error("Error saving MoM:", err);
            alert("Failed to save MoM.");
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
                { userId: user._id },
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

    const handleSubmitSuggestion = async (meetingId) => {
        if (!suggestionText.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/minutes/${meetingId}/suggestions`,
                {
                    userId: user._id,
                    suggestion: suggestionText.trim()
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            alert("Suggestion submitted successfully.");
            setSuggestionBoxIndex(null);
            setSuggestionText("");
        } catch (err) {
            console.error('Error submitting suggestion:', err);
            alert("Failed to submit suggestion.");
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

                {canManageUsers && (
                    <Link
                        to="/manage-users"
                        state={{ committeeName: committee.committeeName }}
                        className="manage-btn"
                    >
                        Manage Users
                    </Link>

                )}

                {canScheduleMeetings && (
                    <a href="/scheduleMeeting" className="schedule-btn">
                        Schedule Meeting
                    </a>
                )}
                <a href="/scheduleCalendar" className="upcoming-btn">
                    Upcoming Meetings
                </a>
                <button className="upcoming-btn" onClick={handleToggleRecentMeetings}>
                    {showRecentMeetings ? 'Hide' : 'Show'} Recent Meetings
                </button>
                {isConvener && (
                    <button className="create-mom-btn" onClick={() => setShowCreateMoM(true)}>
                        Create New MoM
                    </button>
                )}

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
                                <React.Fragment key={index}>
                                    <tr>
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
                                            {isMember && (
                                                <button
                                                    className="suggestion-button"
                                                    onClick={() =>
                                                        setSuggestionBoxIndex(prev => prev === index ? null : index)
                                                    }
                                                    style={{ marginLeft: '10px' }}
                                                >
                                                    Suggestion
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {suggestionBoxIndex === index && isMember && (
                                        <tr>
                                            <td colSpan="5">
                                                <textarea
                                                    style={{ width: '100%', height: '80px', marginTop: '10px' }}
                                                    placeholder="Enter your suggestion here..."
                                                    value={suggestionText}
                                                    onChange={(e) => setSuggestionText(e.target.value)}
                                                />
                                                <button
                                                    style={{ marginTop: '5px' }}
                                                    onClick={() => handleSubmitSuggestion(meeting._id)}
                                                >
                                                    Submit Suggestion
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
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
            {showCreateMoM && isConvener && (
                <section className="create-mom-section">
                    <button className="close-btn" onClick={() => setShowCreateMoM(false)}>✕</button>
                    <h2>Create New Minutes of Meeting</h2>
                    <textarea
                        value={newMinutesText}
                        onChange={(e) => setNewMinutesText(e.target.value)}
                        placeholder="Enter meeting minutes here..."
                        rows="10"
                    />
                    <button onClick={handleSaveNewMoM} className="save-mom-btn">
                        Save MoM
                    </button>
                </section>
            )}

        </div>
    );
}

export default CommitteeDashboard;
