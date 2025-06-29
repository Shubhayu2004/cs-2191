import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from "jspdf";
import "../styles/committeeDash.css";
import { UserDataContext } from '../context/UserDataContext';
import React from "react";

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
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    // Determine the user's role for this committee
    let userCommitteeRole = null;
    if (committee && user?.email) {
        if (committee.chairman && committee.chairman.email === user.email) {
            userCommitteeRole = "chairman";
        } else if (committee.convener && committee.convener.email === user.email) {
            userCommitteeRole = "convener";
        } else if (committee.members && Array.isArray(committee.members)) {
            const found = committee.members.find(m => m.email === user.email);
            if (found) userCommitteeRole = found.role || "member";
        }
    }

    // Global admin check (remains admin for all committees)
    const isAdmin = user?.status === "admin";
    // Role-based access for this committee
    const isConvener = userCommitteeRole === "convener";
    const isMember = userCommitteeRole === "member";
    const isChairman = userCommitteeRole === "chairman";
    // Admin can always see Manage Users, but other actions are per-committee role
    const canEditMinutes = isConvener;
    const canScheduleMeetings = isConvener;
    const canManageUsers = isAdmin ;
    const [newMinutesText, setNewMinutesText] = useState("");
    const [showCreateMoM, setShowCreateMoM] = useState(false);
    const [newMoMTopic, setNewMoMTopic] = useState("");
    const [newMoMDate, setNewMoMDate] = useState("");
    const [newMoMTime, setNewMoMTime] = useState("");


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
    if (selectedMeetingIndex === null) return;

    const updatedMeetings = [...recentMeetings];
    updatedMeetings[selectedMeetingIndex].minutesText = editedMinutes;

    // Detect if it's a dummy meeting (no _id property)
    const isDummy = !recentMeetings[selectedMeetingIndex]._id;

    if (isDummy) {
        // Just update the local state
        setRecentMeetings(updatedMeetings);
        setShowMinutes(false);
        setSelectedMeetingIndex(null);
        alert("Dummy meeting minutes updated locally.");
        return;
    }

    if (!canEditMinutes) return;

    try {
        const token = localStorage.getItem('token');
        const meeting = recentMeetings[selectedMeetingIndex];
        // Validate and format date/time
        const formattedDate = meeting.date ? new Date(meeting.date).toISOString().slice(0, 10) : '';
        let formattedTime = meeting.time;
        if (formattedTime && formattedTime.length === 5 && formattedTime[2] === ':') {
            // already in HH:mm
        } else if (formattedTime && formattedTime.match(/\d{1,2}:\d{2}\s?(AM|PM)/i)) {
            // Convert 12-hour to 24-hour
            const [time, period] = formattedTime.split(/\s/);
            let [hours, minutes] = time.split(":");
            hours = parseInt(hours, 10);
            if (/PM/i.test(period) && hours < 12) hours += 12;
            if (/AM/i.test(period) && hours === 12) hours = 0;
            formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
        if (!meeting.topic || !formattedDate || !formattedTime || !editedMinutes.trim()) {
            alert("All fields (topic, date, time, minutes) are required.");
            return;
        }
        await axios.put(
            `${import.meta.env.VITE_BASE_URL}/api/minutes/${meeting._id}`,
            {
                topic: meeting.topic,
                date: formattedDate,
                time: formattedTime,
                minutesText: editedMinutes,
                committeeId: meeting.committeeId || committee._id || id
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
    } catch (err) {
        setError('Failed to save minutes: ' + (err.response?.data?.message || err.message));
        alert('Failed to save minutes: ' + (err.response?.data?.message || err.message));
    }
};

    const handleSaveNewMoM = async () => {
        if (!newMoMTopic.trim() || !newMoMDate || !newMoMTime || !newMinutesText.trim()) {
            alert("Please fill in all fields for the new MoM.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}/api/minutes/create`,
                {
                    committeeId: id,
                    topic: newMoMTopic,
                    date: newMoMDate,
                    time: newMoMTime,
                    minutesText: newMinutesText
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            alert("MoM saved successfully!");
            setNewMinutesText("");
            setNewMoMTopic("");
            setNewMoMDate("");
            setNewMoMTime("");
            setShowCreateMoM(false);
            fetchMinutes();
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

    const handleDissolveCommittee = async () => {
        const confirmed = window.confirm('Are you sure you want to dissolve this committee? This action cannot be undone.');
        if (!confirmed) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${import.meta.env.VITE_BASE_URL}/api/committees/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    data: { committeeId: id }
                }
            );
            alert('Committee dissolved successfully.');
            navigate('/committee');
        } catch (err) {
            console.error('Error dissolving committee:', err);
            setError(err.response?.data?.message || 'Error dissolving committee');
            alert('Failed to dissolve committee: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSubmitSuggestion = async (meetingId) => {
        if (!meetingId) {
            alert("Cannot submit suggestion for this meeting.");
            return;
        }
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

    const handleViewSuggestions = async () => {
        setShowSuggestions((prev) => !prev);
        if (!showSuggestions) {
            setLoadingSuggestions(true);
            try {
                const token = localStorage.getItem('token');
                // Fetch all meetings for this committee
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/api/minutes/committee/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                const meetings = response.data || [];
                // Fetch suggestions for each meeting
                const allSuggestions = [];
                for (const meeting of meetings) {
                    if (!meeting._id) continue;
                    const sugRes = await axios.get(
                        `${import.meta.env.VITE_BASE_URL}/api/minutes/${meeting._id}/suggestions`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    const suggestionsForMeeting = (sugRes.data || []).map(s => ({
                        ...s,
                        meetingTopic: meeting.topic,
                        meetingDate: meeting.date,
                    }));
                    allSuggestions.push(...suggestionsForMeeting);
                }
                setSuggestions(allSuggestions);
            } catch {
                setSuggestions([]);
            } finally {
                setLoadingSuggestions(false);
            }
        }
    };

    const handleEditMoM = (meeting) => {
        // Find the index of the meeting in recentMeetings
        const index = recentMeetings.findIndex(m => m._id === meeting._id);
        if (index !== -1) {
            setSelectedMeetingIndex(index);
            setEditedMinutes(meeting.minutesText);
            setShowMinutes(true);
        }
    };

    // For convener: suggestions grouped by MoM
    const [momSuggestions, setMomSuggestions] = useState([]);

    useEffect(() => {
        if (isConvener && showRecentMeetings) {
            const fetchSuggestions = async () => {
                setLoadingSuggestions(true);
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(
                        `${import.meta.env.VITE_BASE_URL}/api/minutes/committee/${id}/suggestions`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    setMomSuggestions(res.data || []);
                } catch {
                    setMomSuggestions([]);
                } finally {
                    setLoadingSuggestions(false);
                }
            };
            fetchSuggestions();
        }
    }, [isConvener, showRecentMeetings, id]);

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
                    </div>

                    <div className="convener">
                        <h4>Convener</h4>
                        <p>Name: {committee.convener.name}</p>
                        <p>Email: {committee.convener.email}</p>
                    </div>
                </div>
            </div>

            <div className="utility">
                {canManageUsers && (
                    <Link
                        to={`/manage-users?committeeId=${id}`}
                        state={{ committeeId: id, committeeName: committee.committeeName }}
                        className="manage-btn"
                    >
                        Manage Users
                    </Link>
                )}
                <a
                    href={`/scheduleCalendar?committeeId=${id}`}
                    className="upcoming-btn"
                >
                    Upcoming Meetings
                </a>
                <button className="upcoming-btn" onClick={handleToggleRecentMeetings}>
                    {showRecentMeetings ? 'Hide' : 'Show'} Recent Meetings
                </button>
                {canScheduleMeetings && (
                    <Link
                        to={`/scheduleMeeting`}
                        state={{ committeeId: id, committeeName: committee.committeeName }}
                        className="upcoming-btn"
                    >
                        Schedule Meeting
                    </Link>
                )}
                {isConvener && (
                    <button className="create-mom-btn" onClick={() => setShowCreateMoM(true)}>
                        Create New MoM
                    </button>
                )}
                {/* Dissolve Committee button for chairman only */}
                {isChairman && (
                    <button onClick={handleDissolveCommittee} className="dissolve-btn" style={{backgroundColor: 'red', color: 'white'}}>
                        Dissolve Committee
                    </button>
                )}
            </div>

            <div className="members">
                <h2>Committee Members</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Sl No.</th>
                            <th>Name</th>
                            <th>Email ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {committee.members.map((member, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{member.name}</td>
                                <td>{member.email}</td>
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
                                            {meeting._id && isMember && (
                                                <button
                                                    className="suggestion-button"
                                                    onClick={() => setSuggestionBoxIndex(prev => prev === index ? null : index)}
                                                    style={{ marginLeft: '10px' }}
                                                >
                                                    Suggestion
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleViewMinutes(meeting.minutesText, index)}
                                                className="minutes-button"
                                            >
                                                View Minutes
                                            </button>
                                        </td>
                                    </tr>
                                    {/* For convener: show suggestions for this MoM */}
                                    {isConvener && momSuggestions.length > 0 && meeting._id && (
                                        <tr>
                                            <td colSpan={5}>
                                                <div style={{ background: '#f6faff', border: '1px solid #b3e0ff', padding: '8px', margin: '8px 0' }}>
                                                    <strong>Suggestions for this MoM:</strong>
                                                    {loadingSuggestions ? (
                                                        <div>Loading suggestions...</div>
                                                    ) : (
                                                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                                                            {(momSuggestions.find(m => m.mom._id === meeting._id)?.suggestions || []).length === 0 ? (
                                                                <li>No suggestions.</li>
                                                            ) : (
                                                                momSuggestions.find(m => m.mom._id === meeting._id).suggestions.map((s, idx) => (
                                                                    <li key={s._id || idx}>
                                                                        <b>{s.userId?.fullname?.firstname || s.userId?.email || 'Unknown'}:</b> {s.suggestion}
                                                                    </li>
                                                                ))
                                                            )}
                                                        </ul>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {suggestionBoxIndex === index && isMember && meeting._id && (
                                        <tr>
                                            <td colSpan={5}>
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
                    <label>Topic:</label>
                    <input
                        type="text"
                        placeholder="Enter meeting topic"
                        className="mom-input"
                        value={newMoMTopic}
                        onChange={e => setNewMoMTopic(e.target.value)}
                    />
                    <label>Date :</label>
                    <input
                        type="date"
                        className="mom-input"
                        value={newMoMDate}
                        onChange={e => setNewMoMDate(e.target.value)}
                    />
                    <label>Time :</label>
                    <input
                        type="time"
                        className="mom-input"
                        value={newMoMTime}
                        onChange={e => setNewMoMTime(e.target.value)}
                    />
                    <textarea
                        value={newMinutesText}
                        onChange={e => setNewMinutesText(e.target.value)}
                        placeholder="Enter meeting minutes here..."
                        rows="10"
                    />
                    <button onClick={handleSaveNewMoM} className="save-mom-btn">
                        Save MoM
                    </button>
                </section>
            )}

            {showSuggestions && (
                <section className="suggestions-section">
                    <button className="close-btn" onClick={() => setShowSuggestions(false)}>✕</button>
                    <h2>Member Suggestions</h2>
                    {loadingSuggestions ? (
                        <div>Loading suggestions...</div>
                    ) : suggestions.length === 0 ? (
                        <div>No suggestions found.</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Meeting Topic</th>
                                    <th>Meeting Date</th>
                                    <th>Member</th>
                                    <th>Suggestion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suggestions.map((s, idx) => (
                                    <tr key={s._id || idx}>
                                        <td>{s.meetingTopic}</td>
                                        <td>{s.meetingDate ? new Date(s.meetingDate).toLocaleDateString() : ''}</td>
                                        <td>{
  s.userId && typeof s.userId === 'object'
    ? (s.userId.firstname && s.userId.lastname
        ? `${s.userId.firstname} ${s.userId.lastname}`
        : (typeof s.userId.fullname === 'string' ? s.userId.fullname : (typeof s.userId.email === 'string' ? s.userId.email : JSON.stringify(s.userId))))
    : (typeof s.userId === 'string' ? s.userId : 'Unknown')
}</td>
                                        <td>{s.suggestion}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}

        </div>
    );
}

export default CommitteeDashboard;
