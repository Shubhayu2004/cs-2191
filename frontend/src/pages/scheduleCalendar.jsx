import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from "../styles/scheduleMeeting.module.css";

const localizer = momentLocalizer(moment);

const ScheduledMeetingsCalendar = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null); // State for selected event

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

    return (
        <div className={styles} style={{ height: "80vh", margin: "20px", position: "relative" }}>
            <h2>Meeting Schedule</h2>
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
                        style={{
                            color: "black",
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            border: "none",
                            background: "transparent",
                            fontSize: "30px",
                            cursor: "pointer",
                        }}
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
