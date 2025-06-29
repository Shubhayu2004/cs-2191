import { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate and useLocation
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from "../styles/scheduleMeeting.module.css";
import Sidebar from '../components/Sidebar';
import axios from "axios";

const localizer = momentLocalizer(moment);

const ScheduledMeetingsCalendar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Get committeeId from query string
    const searchParams = new URLSearchParams(location.search);
    const committeeId = searchParams.get("committeeId");

    useEffect(() => {
        async function fetchMeetings() {
            if (!committeeId) return;
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/api/meetings/committee/${committeeId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const meetings = response.data || [];
                console.log('Fetched meetings:', meetings);
                const formattedEvents = meetings.map((meeting, index) => {
                    const baseDate = new Date(meeting.date);
                    let startDate = new Date(baseDate);
                    if (meeting.time) {
                        const [hours, minutes] = meeting.time.split(":");
                        startDate.setHours(Number(hours), Number(minutes), 0, 0);
                    }
                    console.log('Event:', meeting.topic, 'Date:', meeting.date, 'Time:', meeting.time, 'Start:', startDate);
                    return {
                        id: meeting._id || index,
                        title: meeting.topic,
                        start: startDate,
                        end: startDate,
                        location: meeting.location || "",
                        description: meeting.minutesText || meeting.description || "",
                    };
                });
                setEvents(formattedEvents);
            } catch (err) {
                console.error('Error fetching meetings:', err);
                setEvents([]);
            }
        }
        fetchMeetings();
    }, [committeeId]);

    const handleEventSelect = (event) => {
        setSelectedEvent(event); // Update the selected event details
    };

    const handleClosePopup = () => {
        setSelectedEvent(null); // Close the popup by clearing selected event
    };

    const handleGoBack = () => {
        navigate(-1); // Go to the previous page
    };

    return (
        <div className={styles.scheduleMeetingContainer} style={{ height: "80vh", margin: "20px", position: "relative" }}>
            <Sidebar 
    isOpen={isSidebarOpen} 
    onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
    className={styles.scheduleSidebar} // Pass the new style
/>


            {/* Header and Go Back Button Section */}
            <div className={styles.headerContainer}>
                <h2>Meeting Schedule</h2>
                <button 
                    onClick={handleGoBack} 
                    className="buttongobackcalendar"
                >
                    Go Back
                </button>
            </div>

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                onSelectEvent={handleEventSelect} // Attach event click handler
            />

            {/* Popup modal for selected event */}
            {selectedEvent && (
                <div className={styles.popup}>
                    <button
                        onClick={handleClosePopup}
                        className={styles.closeButton}
                    >
                        &times;
                    </button>
                    <h3>{selectedEvent.title}</h3>
                    <p><strong>Location:</strong> {selectedEvent.location}</p>
                    <p><strong>Description:</strong> {selectedEvent.description}</p>
                    <p><strong>Start Time:</strong> {moment(selectedEvent.start).format('MMMM Do YYYY, h:mm:ss a')}</p>
                </div>
            )}
        </div>
    );
};

export default ScheduledMeetingsCalendar;
