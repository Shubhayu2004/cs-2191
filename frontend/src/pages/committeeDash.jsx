import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/committeeDash.css"; // Add your styles here or inline styles

function CommitteeDashboard() {
    const navigate = useNavigate();

    const [showUpcomingMeetings, setShowUpcomingMeetings] = useState(false);
    const [showRecentMeetings, setShowRecentMeetings] = useState(false);
    const [showMinutesForm, setShowMinutesForm] = useState(false);

    const upcomingMeetingsData = [
        { topic: 'Exam', date: '19/11/2024', time: '14:30' },
        { topic: 'Research', date: '19/12/2024', time: '14:30' },
        { topic: 'AI Workshop', date: '25/12/2024', time: '10:00' },
        { topic: 'Tech Team Sync', date: '02/01/2025', time: '09:30' },
        { topic: 'Cloud Deployment Review', date: '10/01/2025', time: '16:00' },
        { topic: 'API Integration Discussion', date: '15/01/2025', time: '11:00' },
        { topic: 'Code Quality Audit', date: '20/01/2025', time: '15:30' },
        { topic: 'DevOps Strategy Planning', date: '28/01/2025', time: '13:00' },
        { topic: 'Cybersecurity Awareness', date: '05/02/2025', time: '10:30' },
        { topic: 'System Architecture Review', date: '12/02/2025', time: '14:00' }
    ];



    const recentMeetingsData = [
        { topic: 'Exam', date: '19/10/2024', time: '14:30', minutes: 'minutes1.pdf' },
        { topic: 'Research', date: '29/10/2024', time: '15:00', minutes: 'minutes2.pdf' },
        { topic: 'AI Ethics Discussion', date: '05/10/2024', time: '11:00', minutes: 'minutes3.pdf' },
        { topic: 'Backend Optimization Review', date: '10/10/2024', time: '13:30', minutes: 'minutes4.pdf' },
        { topic: 'Blockchain Implementation', date: '12/10/2024', time: '10:00', minutes: 'minutes5.pdf' },
        { topic: 'Frontend Frameworks Comparison', date: '15/10/2024', time: '16:00', minutes: 'minutes6.pdf' },
        { topic: 'Data Privacy Seminar', date: '18/10/2024', time: '09:00', minutes: 'minutes7.pdf' },
        { topic: 'Machine Learning Trends', date: '20/10/2024', time: '14:00', minutes: 'minutes8.pdf' },
        { topic: 'Network Security Assessment', date: '22/10/2024', time: '12:30', minutes: 'minutes9.pdf' },
        { topic: 'Full Stack Development Update', date: '25/10/2024', time: '10:30', minutes: 'minutes10.pdf' }
    ];


    const MembersData = [
        { name: 'Saurav', email: 'saurav482@example.com', mobile: '+919876543210' },
        { name: 'Aritra', email: 'aritra831@example.com', mobile: '+919845673210' },
        { name: 'Tanisha', email: 'tanisha294@example.com', mobile: '+919812345678' },
        { name: 'Arham', email: 'arham117@example.com', mobile: '+919834567890' },
        { name: 'Akshay', email: 'akshay508@example.com', mobile: '+919876123456' },
        { name: 'Akshay', email: 'akshay672@example.com', mobile: '+919876987654' },
        { name: 'Akshay', email: 'akshay329@example.com', mobile: '+919876543219' },
        { name: 'Akshay', email: 'akshay840@example.com', mobile: '+919876000001' },
        { name: 'Akshay', email: 'akshay123@example.com', mobile: '+919876543456' },
        { name: 'Arham', email: 'arham902@example.com', mobile: '+919812456789' }
    ];


    useEffect(() => {


    }, []);

    const populateMembers = () => {
        return MembersData.map((member, index) => (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{member.name} </td>
                <td>{member.email} </td>
                <td>{member.mobile} </td>
            </tr>
        ));
    };


    const populateUpcomingMeetings = () => {
        return upcomingMeetingsData.map((meeting, index) => (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{meeting.topic} </td>
                <td>{meeting.date} </td>
                <td>{meeting.time} </td>
            </tr>
        ));
    };

    const populateRecentMeetings = () => {
        return recentMeetingsData.map((meeting, index) => (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{meeting.topic}</td>
                <td>{meeting.date}</td>
                <td>{meeting.time}</td>
                <td>
                    <button
                        onClick={() => {
                            console.log("View button clicked for:", meeting);
                            toggleSection(setShowMinutesForm);
                        }}
                    >
                        View
                    </button>
                </td>
            </tr>
        ));
    };

    const toggleSection = (setter) => {
        console.log("Toggling section"); // Debug log
        setter((prev) => !prev);
    };

    const generatePDF = () => {
        import("jspdf").then((jsPDF) => {
            const doc = new jsPDF.jsPDF();
            const content = document.getElementById("detail").value;
            doc.text(content, 10, 10);
            doc.save("minutes.pdf");
        });
    };

    return (
        <div className="committeeDash">
            <div className="back">
                <button onClick={() => navigate('/committee')}>
                    Go Back
                </button>
            </div>
            <div className="primary">
                <div className="desc">
                    <h2 id="comName">Tech Committee</h2>
                    <h3 id="purp">Purpose :</h3>
                    <p id="purpose">
                        This committee is formed with the moto of discussing tech events to
                        be conducted by the Department of Computer Science and Technology
                    </p>
                </div>
                <div className="chief">
                    <h4>Chairperson : Subhayu</h4>
                    <h4>Convenor : Aishik</h4>
                </div>
            </div>
            <div className="utility">
                <button
                    id="upcoming-meetings-btn"
                    onClick={() => toggleSection(setShowUpcomingMeetings)}
                >
                    Upcoming Meetings
                </button>
                <button
                    id="recent-meetings-btn"
                    onClick={() => toggleSection(setShowRecentMeetings)}
                >
                    Recent Meetings
                </button>
                <button id="leave">Leave</button>
            </div>
            <div className="members">
                <h2 id="listHead">Committee Members</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Sl No.</th>
                            <th>Name</th>
                            <th>Email ID</th>
                            <th>Contact No.</th>
                        </tr>
                    </thead>
                    <tbody id="member-list">
                        {populateMembers()}
                    </tbody>
                </table>
            </div>

            {showUpcomingMeetings && (
                <section id="upcoming-meetings-section">
                    <button
                        type="button"
                        className="close-btn"
                        onClick={() => setShowUpcomingMeetings(false)}
                    >
                        x
                    </button>
                    <h2 style={{ textAlign: "center" }}>Upcoming Meetings</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Sl No.</th>
                                <th>Topic</th>
                                <th>Date</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody id="upcoming-meetings-tbody">
                            {populateUpcomingMeetings()}
                        </tbody>
                    </table>
                </section>
            )}

            {showRecentMeetings && (
                <section id="recent-meetings-section">
                    <button
                        type="button"
                        className="close-btn"
                        onClick={() => setShowRecentMeetings(false)}
                    >
                        x
                    </button>
                    <h2 style={{ textAlign: "center" }}>Recent Meetings</h2>
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
                        <tbody id="recent-meetings-tbody">
                            {populateRecentMeetings()}
                        </tbody>
                    </table>
                </section>
            )}

            {showMinutesForm && (
                <section id="minu">
                    <form id="minutes">
                        <button
                            type="button"
                            className="close-btn"
                            onClick={() => setShowMinutesForm(false)}
                        >
                            x
                        </button>
                        <label htmlFor="detail">Enter the details:</label>
                        <textarea id="detail" />
                        <br />
                        <br />
                        <button type="button" id="save" onClick={() => setShowMinutesForm(false)}>
                            Save
                        </button>
                        <button type="button" id="generate-pdf" onClick={generatePDF}>
                            Generate PDF
                        </button>
                    </form>
                </section>
            )}
        </div>
    );
}

export default CommitteeDashboard;
