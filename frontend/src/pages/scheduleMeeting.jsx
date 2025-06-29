import styles from "../styles/scheduleMeeting.module.css";
import { useState, useEffect, useContext } from "react";
import Sidebar from '../components/Sidebar';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext } from '../context/UserDataContext';

const ScheduleMeeting = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [scheduleMeetingVisibility, setScheduleMeetingVisibility] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '',
        description: '',
    });
    const location = useLocation();
    const params = useParams();
    const { user } = useContext(UserDataContext);
    const [committee, setCommittee] = useState(null);
    const [loading, setLoading] = useState(true);
    // Try to get committeeId from route state, fallback to useParams
    const committeeId = location.state?.committeeId || params.id;

    const toggleScheduleMeetingVisibility = () => {
        setScheduleMeetingVisibility(!scheduleMeetingVisibility);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const { title, date, startTime, description } = formData;
        if (title && date && startTime) {
            try {
                const token = localStorage.getItem('token');
                await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/api/minutes/create`,
                    {
                        committeeId,
                        topic: title,
                        date,
                        time: startTime,
                        minutesText: description || 'No minutes yet',
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                alert(`Meeting Scheduled: ${title} on ${date} at ${startTime}`);
                setFormData({
                    title: '',
                    date: '',
                    startTime: '',
                    location: '',
                    description: '',
                });
                setScheduleMeetingVisibility(false);
            } catch {
                alert('Failed to schedule meeting.');
            }
        } else {
            alert('Please fill in all required fields');
        }
    };

    // Fetch committee data to check role
    useEffect(() => {
        async function fetchCommittee() {
            if (!committeeId) return;
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/api/committees/${committeeId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCommittee(response.data);
            } catch {
                setCommittee(null);
            } finally {
                setLoading(false);
            }
        }
        fetchCommittee();
    }, [committeeId]);

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
    const isConvener = userCommitteeRole === "convener";

    if (loading) return <div>Loading...</div>;
    if (!isConvener) return <div>You do not have permission to schedule meetings for this committee.</div>;

    return (
        <div className={styles.scheduleMeetingContainer}>
            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                className={styles.scheduleSidebar}
            />
            <button className={styles.btnForMeeting} onClick={toggleScheduleMeetingVisibility}>
                Schedule A Meeting
            </button>
            <a href="/scheduleCalendar" className={styles.btnForMeeting}>
                View Schedule
            </a>
            {scheduleMeetingVisibility && (
                <section className={styles.scheduleMeetingForm}>
                    <form onSubmit={handleFormSubmit}>
                        <label htmlFor="title">Title:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                        <label htmlFor="date">Date:</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                        />
                        <label htmlFor="startTime">Start Time:</label>
                        <input
                            type="time"
                            id="startTime"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            required
                        />
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                        ></textarea>
                        <button className={styles.btnForMeeting} type="submit">
                            Schedule Meeting
                        </button>
                    </form>
                </section>
            )}
        </div>
    );
};

export default ScheduleMeeting;
