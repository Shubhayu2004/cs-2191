import './scheduleMeeting.css';
import React, { useState } from 'react';

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
        <div className="schedule-meeting">
            <button className="btn" onClick={toggleScheduleMeetingVisibility}>
                Schedule A Meeting
            </button>

            {scheduleMeetingVisibility && (
                <section id="scheduleMeetingForm">
                    <button className="btn" onClick={toggleCommitteeList}>
                        Select Committee
                    </button>
                    {showCommitteeList && (
                        <div className="committee-list">
                            {committee.map((member) => (
                                <div
                                    key={member}
                                    className={`committee ${
                                        selectedCommittees.includes(member) ? 'selected' : ''
                                    }`}
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

                        <button className="btn" type="submit">
                            Schedule Meeting
                        </button>
                    </form>
                </section>
            )}
        </div>
    );
};

export default ScheduleMeeting;
