import styles from "../styles/scheduleMeeting.module.css";
import React, { useState, useEffect } from "react";


const ScheduleMeeting = () => {
    const [scheduleMeetingVisibility, setScheduleMeetingVisibility] = useState(false);
    const [showCommitteeList, setShowCommitteeList] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '',
        location: '',
        description: '',
    });
    const committee = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const [selectedCommittees, setSelectedCommittees] = useState([]);
    const [meetings, setMeetings] = useState([]);

    useEffect(() => {
        const storedMeetings = JSON.parse(localStorage.getItem('meetings')) || [];
        setMeetings(storedMeetings);
    }, []);

    const toggleScheduleMeetingVisibility = () => {
        setScheduleMeetingVisibility(!scheduleMeetingVisibility);
    };

    const toggleCommitteeList = () => {
        setShowCommitteeList(!showCommitteeList);
    };

    const handleCommitteeSelection = (member) => {
        setSelectedCommittees((prev) =>
            prev.includes(member)
                ? prev.filter((item) => item !== member)
                : [...prev, member]
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const { title, date, startTime } = formData;

        if (title && date && startTime) {
            const newMeeting = { ...formData, selectedCommittees };
            const updatedMeetings = [...meetings, newMeeting];
            setMeetings(updatedMeetings);
            localStorage.setItem('meetings', JSON.stringify(updatedMeetings));

            alert(`Meeting Scheduled: ${title} on ${date} at ${startTime}`);
            setFormData({
                title: '',
                date: '',
                startTime: '',
                location: '',
                description: '',
            });
            setSelectedCommittees([]);
            setScheduleMeetingVisibility(false);
        } else {
            alert('Please fill in all required fields');
        }
    };

    return (
        <div className={styles.scheduleMeetingContainer}>
            <button className={styles.btnForMeeting} onClick={toggleScheduleMeetingVisibility}>
                Schedule A Meeting
            </button>
            <a href="/scheduleCalendar" className={styles.btnForMeeting}>View Schedule</a>
            {scheduleMeetingVisibility && (
                <section className={styles.scheduleMeetingForm}>
                    <button className={styles.btnForMeeting} onClick={toggleCommitteeList}>
                        Select Committee
                    </button>
                    {showCommitteeList && (
                        <div className={styles.committeeListForMeeting}>
                            {committee.map((member) => (
                                <div
                                    key={member}
                                    className={`${styles.committeeForMeeting} ${selectedCommittees.includes(member) ? styles.selected : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={member}
                                        value={member}
                                        checked={selectedCommittees.includes(member)}
                                        onChange={() => handleCommitteeSelection(member)}
                                    />
                                    <label htmlFor={member}>{member}</label>
                                </div>
                            ))}
                        </div>
                    )}

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

                        <label htmlFor="location">Location/Link:</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
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
