import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from "../styles/scheduleMeeting.module.css";
import Sidebar from '../components/Sidebar';

const localizer = momentLocalizer(moment);

const ScheduledMeetingsCalendar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null); // State for selected event
    const navigate = useNavigate(); // Initialize navigate function

    useEffect(() => {
        const storedMeetings = JSON.parse(localStorage.getItem("meetings")) || [];

        const formattedEvents = storedMeetings.map((meeting, index) => ({
            id: index,
            title: meeting.title,
            start: new Date(`${meeting.date}T${meeting.startTime}`),
            end: new Date(`${meeting.date}T${meeting.startTime}`),
            location: meeting.location,
            description: meeting.description,
        }));

        setEvents(formattedEvents);
    }, []);

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
